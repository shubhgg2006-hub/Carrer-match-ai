import re
from typing import List, Dict, Tuple
from app.models.schemas import BulletImprovementItem, ResumeImprovementResult, ParsedResume

WEAK_VERBS = [
    "helped with", "worked on", "responsible for", "handled", "assisted in", "did",
    "participated in", "involved in", "made", "looked after", "supported", "contributed to",
    "was part of", "tasked with"
]

STRONG_ACTION_VERBS = [
    "Architected", "Engineered", "Orchestrated", "Spearheaded", "Optimized",
    "Implemented", "Automated", "Streamlined", "Accelerated", "Designed",
    "Formulated", "Synthesized", "Benchmarked", "Refactored", "Deployed"
]

METRIC_PATTERN = re.compile(r'(?:\d+[\.,]?\d*|\d+%\s*|\$\d+|\b[1-9]\d*x\b|\b[1-9]\d*k\b)', re.IGNORECASE)

REWRITE_TEMPLATES = [
    ("worked on", "Architected and delivered", "Replaced passive 'worked on' with strong leadership verb 'Architected and delivered'."),
    ("responsible for", "Spearheaded the engineering of", "Replaced passive duty statement with proactive ownership."),
    ("helped with", "Engineered core modules for", "Clarified personal technical contribution instead of general assistance."),
    ("handled", "Orchestrated end-to-end implementation of", "Emphasized systematic execution and operational excellence."),
    ("assisted in", "Collaborated to design and benchmark", "Elevated collaborative engineering impact."),
    ("participated in", "Co-engineered and deployed", "Made technical role specific and result-oriented."),
    ("involved in", "Executed the technical refactoring of", "Specified direct technical contribution.")
]

def analyze_resume_quality(resume: ParsedResume) -> ResumeImprovementResult:
    """
    Evaluates resume bullet points for action verbs, quantifiable achievements,
    repetition, and provides before-and-after suggestions with transparent placeholders.
    """
    bullet_items: List[BulletImprovementItem] = []
    formatting_critique: List[str] = []
    
    all_bullets = []
    for exp in resume.work_experience:
        all_bullets.extend(exp.bullets)
    for proj in resume.projects:
        all_bullets.extend(proj.bullets)
        
    # Also fallback to raw text lines if bullets empty
    if not all_bullets:
        for line in resume.raw_text.splitlines():
            line_s = line.strip()
            if len(line_s) > 25 and not line_s.endswith(":"):
                all_bullets.append(line_s)

    weak_count = 0
    metrics_count = 0

    for bullet in all_bullets[:10]:
        bullet_lower = bullet.lower()
        has_metric = bool(METRIC_PATTERN.search(bullet))
        if has_metric:
            metrics_count += 1
            
        found_weak = [wv for wv in WEAK_VERBS if wv in bullet_lower]
        if found_weak:
            weak_count += len(found_weak)
            
        issues = []
        if not has_metric:
            issues.append("Lacks quantifiable metric or measured outcome (e.g., latency, users, % improvement).")
        if found_weak:
            issues.append(f"Uses passive/weak phrasing: '{', '.join(found_weak)}'.")
        if len(bullet.split()) < 7:
            issues.append("Bullet is too brief to convey full engineering context.")
            
        # Build improved suggestion if issues present
        if issues:
            improved = bullet
            rationale_notes = []
            
            # Replace weak verb
            for weak_v, strong_v, explanation in REWRITE_TEMPLATES:
                pattern = re.compile(re.escape(weak_v), re.IGNORECASE)
                if pattern.search(improved):
                    improved = pattern.sub(strong_v, improved, count=1)
                    rationale_notes.append(explanation)
                    break
                    
            if not rationale_notes:
                # Prefix with a strong verb if bullet started casually
                first_word = bullet.split()[0] if bullet.split() else ""
                if first_word.lower() not in [v.lower() for v in STRONG_ACTION_VERBS]:
                    improved = f"Engineered and deployed {bullet[0].lower() + bullet[1:]}"
                    rationale_notes.append("Framed statement with active engineering verb.")
                    
            # Add quantifiable metric placeholder if missing
            if not has_metric:
                improved = f"{improved.rstrip('.')}, enhancing efficiency by [X]% and supporting [Y,000+] active workflows."
                rationale_notes.append("Appended standard impact metric placeholder ([X]%, [Y,000+]) for candidate to fill with verified figures.")
                
            bullet_items.append(BulletImprovementItem(
                original_bullet=bullet,
                improved_bullet=improved,
                rationale=" ".join(rationale_notes),
                detected_issues=issues,
                weak_verbs_found=found_weak,
                missing_metric=not has_metric
            ))

    # Formatting and organization critique
    if metrics_count == 0:
        formatting_critique.append("Critical: No quantifiable achievements (percentages, numbers, throughput) detected. Add measured outcomes.")
    elif metrics_count < 3:
        formatting_critique.append("Strengthen impact by incorporating measurable metrics into at least 70% of project and work experience bullets.")

    if not resume.projects:
        formatting_critique.append("Include a dedicated 'Projects' section showcasing 2-3 prominent technical implementations.")

    if len(resume.skills) < 5:
        formatting_critique.append("Expand the 'Technical Skills' section into categorized groups (Languages, Frameworks, Cloud, Databases).")

    return ResumeImprovementResult(
        bullet_suggestions=bullet_items,
        strong_action_verbs_recommended=STRONG_ACTION_VERBS,
        formatting_critique=formatting_critique,
        metrics_detected_count=metrics_count,
        weak_verbs_detected_count=weak_count
    )
