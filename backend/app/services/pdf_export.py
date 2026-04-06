from fpdf import FPDF


def _safe(text: str) -> str:
    """Replace non-latin-1 characters with safe alternatives."""
    replacements = {
        "\u2013": "-",   # en dash
        "\u2014": "-",   # em dash
        "\u2018": "'",   # left single quote
        "\u2019": "'",   # right single quote
        "\u201c": '"',   # left double quote
        "\u201d": '"',   # right double quote
        "\u2022": "-",   # bullet
        "\u2026": "...", # ellipsis
        "\u00b7": "-",   # middle dot
        "\uf0b7": "-",   # common bullet from Word
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text.encode("latin-1", errors="replace").decode("latin-1")


def export_resume_to_pdf(resume_text: str) -> bytes:
    """Export tailored resume text to a clean, single-column PDF."""
    pdf = FPDF(format="letter")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    margin = 18
    pdf.set_left_margin(margin)
    pdf.set_right_margin(margin)
    pdf.set_x(margin)

    w = pdf.w - margin * 2  # usable width

    lines = resume_text.split("\n")
    is_first_line = True

    for line in lines:
        stripped = line.strip()

        if not stripped:
            pdf.ln(3)
            continue

        safe = _safe(stripped)

        # Name — first non-empty line
        if is_first_line:
            pdf.set_font("Helvetica", "B", 18)
            pdf.set_x(margin)
            pdf.cell(w, 9, safe, align="C", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
            is_first_line = False
            continue

        # Contact info line (contains @ or phone-like patterns)
        if is_first_line is False and pdf.get_y() < 45 and ("@" in stripped or "|" in stripped):
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(80, 80, 80)
            pdf.set_x(margin)
            pdf.cell(w, 5, safe, align="C", new_x="LMARGIN", new_y="NEXT")
            pdf.set_text_color(0, 0, 0)
            pdf.ln(1)
            continue

        # Section headers — ALL CAPS or common section names
        section_names = [
            "SUMMARY", "EXPERIENCE", "WORK EXPERIENCE", "EDUCATION",
            "SKILLS", "CERTIFICATIONS", "QUALIFICATIONS", "PROJECTS",
            "PROFESSIONAL EXPERIENCE", "TECHNICAL SKILLS", "AWARDS",
            "PROFESSIONAL SUMMARY", "CORE COMPETENCIES", "OBJECTIVE",
        ]
        is_header = (
            stripped.isupper() and len(stripped) < 60
        ) or stripped.upper().rstrip(":") in section_names

        if is_header:
            pdf.ln(4)
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_x(margin)
            pdf.cell(w, 6, safe.upper(), new_x="LMARGIN", new_y="NEXT")
            # Draw a line under the header
            y = pdf.get_y()
            pdf.set_draw_color(100, 100, 100)
            pdf.line(margin, y, margin + w, y)
            pdf.ln(3)
            continue

        # Bullet points
        if stripped.startswith(("-", "*", "•")) or (len(stripped) > 2 and stripped[0] == "-"):
            bullet_text = stripped.lstrip("-*• ").strip()
            pdf.set_font("Helvetica", "", 9.5)
            pdf.set_x(margin)
            pdf.cell(5, 5, "-")
            pdf.multi_cell(w - 5, 5, _safe(bullet_text), align="L")
            pdf.ln(0.5)
            continue

        # Job title lines (often contain | or pipes for formatting)
        if "|" in stripped and len(stripped) < 120:
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_x(margin)
            pdf.multi_cell(w, 5.5, safe, align="L")
            pdf.ln(1)
            continue

        # Regular text
        pdf.set_font("Helvetica", "", 9.5)
        pdf.set_x(margin)
        pdf.multi_cell(w, 5, safe, align="L")
        pdf.ln(0.5)

    return pdf.output()


def export_cover_letter_to_pdf(cover_letter: str) -> bytes:
    """Export cover letter to a clean PDF."""
    pdf = FPDF(format="letter")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    margin = 25
    pdf.set_left_margin(margin)
    pdf.set_right_margin(margin)
    w = pdf.w - margin * 2

    pdf.set_font("Helvetica", "", 11)

    paragraphs = cover_letter.split("\n")
    for para in paragraphs:
        stripped = para.strip()
        if not stripped:
            pdf.ln(6)
        else:
            pdf.set_x(margin)
            pdf.multi_cell(w, 6, _safe(stripped), align="L")

    return pdf.output()
