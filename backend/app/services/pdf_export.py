from fpdf import FPDF


def export_resume_to_pdf(resume_text: str) -> bytes:
    """Export tailored resume text to a clean PDF."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)

    lines = resume_text.split("\n")

    for line in lines:
        stripped = line.strip()
        if not stripped:
            pdf.ln(4)
            continue

        # Detect section headers (all caps or short bold-looking lines)
        if stripped.isupper() and len(stripped) < 60:
            pdf.ln(4)
            pdf.set_font("Helvetica", "B", 12)
            pdf.cell(0, 7, stripped, new_x="LMARGIN", new_y="NEXT")
            pdf.set_draw_color(70, 130, 180)
            pdf.line(10, pdf.get_y(), 200, pdf.get_y())
            pdf.ln(2)
        # Detect name (first non-empty line, likely the name)
        elif pdf.page_no() == 1 and pdf.get_y() < 30:
            pdf.set_font("Helvetica", "B", 16)
            pdf.cell(0, 10, stripped, new_x="LMARGIN", new_y="NEXT", align="C")
        # Bullet points
        elif stripped.startswith(("•", "-", "*")):
            pdf.set_font("Helvetica", "", 10)
            pdf.cell(5)
            pdf.multi_cell(170, 5, stripped)
        else:
            pdf.set_font("Helvetica", "", 10)
            pdf.multi_cell(0, 5, stripped)

    return pdf.output()


def export_cover_letter_to_pdf(cover_letter: str) -> bytes:
    """Export cover letter to a clean PDF."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.set_font("Helvetica", "", 11)

    paragraphs = cover_letter.split("\n")
    for para in paragraphs:
        stripped = para.strip()
        if not stripped:
            pdf.ln(6)
        else:
            pdf.multi_cell(0, 6, stripped)

    return pdf.output()
