import io
from datetime import datetime
from typing import Dict, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)

def generate_pdf_report(analysis_dict: Dict[str, Any]) -> bytes:
    """
    Generates a professional, beautifully styled PDF analysis report.
    Returns the binary content of the PDF.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Styles
    brand_dark = colors.HexColor("#0f172a")
    brand_primary = colors.HexColor("#1e293b")
    brand_cyan = colors.HexColor("#0891b2")
    brand_green = colors.HexColor("#16a34a")
    brand_amber = colors.HexColor("#d97706")
    brand_red = colors.HexColor("#dc2626")
    brand_light = colors.HexColor("#f8fafc")
    border_color = colors.HexColor("#e2e8f0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=brand_dark
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=brand_cyan
    )

    h1_style = ParagraphStyle(
        'Heading1Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=brand_dark,
        spaceBefore=14,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=brand_primary
    )

    body_bold = ParagraphStyle(
        'BodyBoldCustom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=brand_primary
    )

    story = []

    # Header Banner
    header_data = [
        [
            Paragraph("<b>CareerMatch AI</b> — Match & Compatibility Report", title_style),
            Paragraph(f"Generated: {analysis_dict.get('created_at', datetime.now().strftime('%Y-%m-%d %H:%M'))[:10]}", subtitle_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[400, 140])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=brand_cyan, spaceBefore=4, spaceAfter=14))

    # Candidate & Job Metadata Box
    candidate_name = analysis_dict.get('candidate_name', 'Candidate')
    target_job = analysis_dict.get('target_job_title', 'Target Role')
    score = analysis_dict.get('overall_score', 0.0)
    category = analysis_dict.get('compatibility_category', 'Evaluated')
    engine_mode = analysis_dict.get('engine_mode', 'NLP Pipeline')

    summary_data = [
        [
            Paragraph("<b>Candidate:</b>", body_bold),
            Paragraph(candidate_name, body_style),
            Paragraph("<b>Estimated Match Score:</b>", body_bold),
            Paragraph(f"<font size='14' color='{brand_cyan.hexval()}'><b>{score}%</b></font> ({category})", body_style)
        ],
        [
            Paragraph("<b>Target Job:</b>", body_bold),
            Paragraph(target_job, body_style),
            Paragraph("<b>NLP Engine Mode:</b>", body_bold),
            Paragraph(engine_mode, body_style)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[90, 180, 130, 140])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), brand_light),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 12))

    # Executive Summary Paragraph
    story.append(Paragraph("Executive Summary & Match Analysis", h1_style))
    summary_exp = analysis_dict.get('summary_explanation', 'No detailed summary provided.')
    story.append(Paragraph(summary_exp, body_style))
    story.append(Spacer(1, 10))

    # Category Scoring Breakdown Table
    story.append(Paragraph("Scoring Weights & Evaluation Breakdown", h1_style))
    breakdown = analysis_dict.get('scoring_breakdown', {})
    weights_used = breakdown.get('weights_used', {})
    category_status = breakdown.get('category_status', {})

    breakdown_data = [
        ["Category", "Score Component", "Weight Applied", "Category Status"],
        ["Semantic Similarity", f"{breakdown.get('semantic_score', 0.0)}%", f"{weights_used.get('semantic_similarity', 0.35)*100:.0f}%", category_status.get('semantic_similarity', 'Evaluated')],
        ["Required Skills Coverage", f"{breakdown.get('required_skill_score', 0.0)}%", f"{weights_used.get('required_skills', 0.30)*100:.0f}%", category_status.get('required_skills', 'Evaluated')],
        ["Preferred Skills Coverage", f"{breakdown.get('preferred_skill_score', 0.0)}%", f"{weights_used.get('preferred_skills', 0.15)*100:.0f}%", category_status.get('preferred_skills', 'Evaluated')],
        ["Experience Alignment", f"{breakdown.get('experience_score', 0.0)}%", f"{weights_used.get('experience', 0.10)*100:.0f}%", category_status.get('experience', 'Evaluated')],
        ["Education Alignment", f"{breakdown.get('education_score', 0.0)}%", f"{weights_used.get('education', 0.10)*100:.0f}%", category_status.get('education', 'Evaluated')],
    ]
    breakdown_table = Table(breakdown_data, colWidths=[150, 110, 110, 170])
    breakdown_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), brand_primary),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (1, 0), (2, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, brand_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(breakdown_table)
    story.append(Spacer(1, 14))

    # Skill Comparison
    story.append(Paragraph("Skill Comparison & Coverage", h1_style))
    skills_analysis = analysis_dict.get('skills_analysis', {})
    matching_skills = ", ".join(skills_analysis.get('matching_skills', [])) or "None identified"
    missing_req = ", ".join(skills_analysis.get('missing_required', [])) or "None (100% required coverage!)"
    missing_pref = ", ".join(skills_analysis.get('missing_preferred', [])) or "None"
    candidate_extra = ", ".join(skills_analysis.get('candidate_extra_skills', [])) or "None"

    skills_data = [
        [Paragraph("<b>Matching Skills:</b>", body_bold), Paragraph(f"<font color='{brand_green.hexval()}'>{matching_skills}</font>", body_style)],
        [Paragraph("<b>Missing Required Skills:</b>", body_bold), Paragraph(f"<font color='{brand_red.hexval()}'>{missing_req}</font>", body_style)],
        [Paragraph("<b>Missing Preferred Skills:</b>", body_bold), Paragraph(f"<font color='{brand_amber.hexval()}'>{missing_pref}</font>", body_style)],
        [Paragraph("<b>Additional Candidate Skills:</b>", body_bold), Paragraph(candidate_extra, body_style)],
    ]
    skills_table = Table(skills_data, colWidths=[150, 390])
    skills_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 0), (0, -1), brand_light),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(skills_table)
    story.append(Spacer(1, 14))

    # Requirement Evidence Table
    reqs = analysis_dict.get('requirements_analysis', [])
    if reqs:
        story.append(Paragraph("Requirement-by-Requirement Evidence", h1_style))
        req_rows = [["Requirement", "Resume Evidence", "Status"]]
        for r in reqs[:8]: # cap at 8 for PDF page fit
            status = r.get('status', 'Unassessed')
            color_hex = brand_green.hexval() if status == "Matched" else (brand_amber.hexval() if status == "Partially Matched" else brand_red.hexval())
            req_rows.append([
                Paragraph(f"<b>{r.get('requirement', '')}</b>", body_style),
                Paragraph(r.get('resume_evidence', '')[:140], body_style),
                Paragraph(f"<font color='{color_hex}'><b>{status}</b></font>", body_style)
            ])
        req_table = Table(req_rows, colWidths=[140, 300, 100])
        req_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), brand_primary),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, border_color),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, brand_light]),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(req_table)
        story.append(Spacer(1, 14))

    # Skill Development Roadmap
    gaps = analysis_dict.get('skill_gaps', [])
    if gaps:
        story.append(Paragraph("Prioritized Skill Development Roadmap", h1_style))
        gap_rows = [["Priority", "Skill", "Why It Matters", "Suggested Practice Project"]]
        for g in gaps[:5]:
            prio = g.get('priority', 'Medium')
            p_color = brand_red.hexval() if prio == "High" else (brand_amber.hexval() if prio == "Medium" else brand_cyan.hexval())
            gap_rows.append([
                Paragraph(f"<font color='{p_color}'><b>{prio}</b></font>", body_style),
                Paragraph(f"<b>{g.get('skill', '')}</b>", body_style),
                Paragraph(g.get('why_it_matters', '')[:120], body_style),
                Paragraph(g.get('suggested_project', '')[:140], body_style)
            ])
        gap_table = Table(gap_rows, colWidths=[60, 100, 190, 190])
        gap_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), brand_primary),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, border_color),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, brand_light]),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(gap_table)

    # Footer Disclaimer
    story.append(Spacer(1, 20))
    disclaimer = (
        "<b>Disclaimer:</b> The Estimated Match Score and analysis produced by CareerMatch AI are algorithmically "
        "derived NLP indicators intended for educational and resume enhancement purposes. It does not constitute a "
        "guarantee or hiring decision by any employer."
    )
    story.append(Paragraph(disclaimer, ParagraphStyle('Disc', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8, leading=11, textColor=colors.gray)))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
