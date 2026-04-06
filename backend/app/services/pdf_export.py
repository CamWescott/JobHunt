from fpdf import FPDF


def _sanitize(text: str) -> str:
    """Remove characters that fpdf2 can't encode in latin-1."""
    return text.encode("latin-1", errors="replace").decode("latin-1")


def export_resume_to_pdf(resume_text: str) -> bytes:
    """Export tailored resume text to a clean PDF."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_left_margin(15)
    pdf.set_right_margin(15)

    lines = resume_text.split("\n")
    w = pdf.w - pdf.l_margin - pdf.r_margin  # usable width

    for line in lines:
        stripped = line.strip()
        if not stripped:
            pdf.ln(4)
            continue

        safe = _sanitize(stripped)

        if stripped.isupper() and len(stripped) < 60:
            pdf.ln(3)
            pdf.set_font("Helvetica", "B", 11)
            pdf.multi_cell(w, 6, safe)
            pdf.ln(1)
            pdf.set_font("Helvetica", "", 10)
        else:
            pdf.set_font("Helvetica", "", 10)
            pdf.multi_cell(w, 5, safe)

    return pdf.output()


def export_cover_letter_to_pdf(cover_letter: str) -> bytes:
    """Export cover letter to a clean PDF."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_left_margin(15)
    pdf.set_right_margin(15)
    pdf.set_font("Helvetica", "", 11)

    w = pdf.w - pdf.l_margin - pdf.r_margin

    paragraphs = cover_letter.split("\n")
    for para in paragraphs:
        stripped = para.strip()
        if not stripped:
            pdf.ln(6)
        else:
            pdf.multi_cell(w, 6, _sanitize(stripped))

    return pdf.output()
