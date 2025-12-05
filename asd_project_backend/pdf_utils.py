# pdf_utils.py — Hospital Grade, Clean, Adaptive Screening Report
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import io
import datetime


def make_pdf_bytes(user, label, probability, extra=None):
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=45,
        rightMargin=45,
        topMargin=55,
        bottomMargin=55,
    )

    styles = getSampleStyleSheet()

    # ============ STYLES ===============
    title_style = ParagraphStyle(
        "Title",
        parent=styles["Heading1"],
        fontSize=22,
        alignment=1,  # center
        textColor=colors.HexColor("#0F3B75"),
        spaceAfter=10,
    )

    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Heading2"],
        fontSize=13,
        alignment=1,  # center
        textColor=colors.HexColor("#475569"),
        spaceAfter=20,
    )

    header_style = ParagraphStyle(
        "Header",
        parent=styles["Heading3"],
        fontSize=14,
        textColor=colors.HexColor("#0F3B75"),
        spaceBefore=16,
        spaceAfter=10,
    )

    normal_style = ParagraphStyle(
        "Normal",
        parent=styles["Normal"],
        fontSize=11,
        leading=16,
        textColor=colors.HexColor("#1E293B")
    )

    bold_style = ParagraphStyle(
        "Bold",
        parent=styles["Normal"],
        fontSize=11,
        leading=16,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=2,
    )

    flow = []

    # ==============================
    # HEADER (CENTERED)
    # ==============================
    flow.append(Paragraph("NEUROMATE AUTISM SCREENING REPORT", title_style))
    flow.append(Paragraph("AI-Assisted Developmental Assessment", subtitle_style))

    flow.append(Paragraph(
        f"Report Generated: {datetime.datetime.now().strftime('%d %B %Y, %I:%M %p')}",
        normal_style,
    ))
    flow.append(Spacer(1, 18))
    # ==============================
    # DEMOGRAPHICS SECTION (FIXED MAPPING — NO DUPLICATES)
    # ==============================
    flow.append (Paragraph ("Patient Information", header_style))

    demographics = extra.get ("demographics", {}) if extra else {}

    # Clean one-to-one mapping
    mapping = {
        "your name": "Name",
        "how old": "Age",
        "gender": "Gender",
        "country": "Country",
        "ethnicity": "Ethnicity",
        "relation": "Relation",
        "jaundice": "Has Jaundice",
        "asd": "Used ASD Screening Before",  # <— one word catch-all
    }

    used_keys = set ()  # prevent duplicate matches

    for keyword, label_text in mapping.items ():
        match = next (
            (q for q in demographics
             if keyword in q.lower () and q not in used_keys),
            None
        )

        if match:
            used_keys.add (match)
            value = demographics.get (match, "N/A")
        else:
            value = "N/A"

        flow.append (Paragraph (f"<b>{label_text}:</b> {value}", normal_style))

    flow.append (Spacer (1, 12))

    # ==============================
    # SCREENING RESULT
    # ==============================
    flow.append(Paragraph("Screening Summary", header_style))
    flow.append(Paragraph(f"<b>Assessment Outcome:</b> {label}", normal_style))
    flow.append(Paragraph(
        f"<b>Total 'Yes' Responses:</b> {extra.get('total_yes', 0)}",
        normal_style,
    ))
    flow.append(Paragraph(
        f"<b>Guidance:</b> {extra.get('guidance', 'N/A')}",
        normal_style,
    ))

    flow.append(Spacer(1, 18))

    # ==============================
    # CATEGORY TABLE (Scores + Severity)
    # ==============================
    flow.append(Paragraph("Category-Wise Breakdown", header_style))

    scores = extra.get("scores", {})
    severity_labels = extra.get("per_category_labels", {})

    if scores:
        table_data = [
            ["Category", "Score", "Severity"]
        ]

        for cat, score in scores.items():
            readable = cat.replace("_", " ").title()
            severity = severity_labels.get(cat, "N/A")
            table_data.append([readable, str(score), severity])

        table = Table(
            table_data,
            colWidths=[180, 80, 140],
            hAlign="LEFT",
        )

        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("GRID", (0, 0), (-1, -1), 0.7, colors.HexColor("#CBD5E1")),
            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ]))

        flow.append(table)
    else:
        flow.append(Paragraph("No category insights available.", normal_style))

    flow.append(Spacer(1, 20))

    # ==============================
    # RECOMMENDATIONS
    # ==============================
    flow.append(Paragraph("Recommended Next Steps", header_style))

    suggestion_map = {
        "No ASD": [
            "No significant indicators detected.",
            "Continue normal social development.",
            "Re-evaluate if future symptoms appear."
        ],
        "At Risk": [
            "Mild ASD indicators detected.",
            "Encourage communication-based play.",
            "Monitor behaviour over 3–6 months."
        ],
        "Probable ASD": [
            "Moderate ASD indicators detected.",
            "Seek developmental specialist consultation.",
            "Initiate early intervention activities."
        ],
        "Likely ASD": [
            "Strong ASD indicators detected.",
            "Immediate professional evaluation recommended.",
            "Begin structured intervention programs.",
        ]
    }

    for bullet in suggestion_map.get(label, ["No recommendations available."]):
        flow.append(Paragraph(f"• {bullet}", normal_style))

    flow.append(Spacer(1, 20))

    # ==============================
    # FOOTER NOTE
    # ==============================
    flow.append(Paragraph(
        "<i>This document is an automated screening summary and not a medical diagnosis.</i>",
        normal_style,
    ))
    flow.append(Paragraph(
        "<b>Generated by NeuroMate — Adaptive AI Autism Screening Assistant</b>",
        normal_style,
    ))

    doc.build(flow)
    return buffer.getvalue()
