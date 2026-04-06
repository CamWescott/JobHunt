from fpdf import FPDF


def _safe(text: str) -> str:
    """Replace non-latin-1 characters with safe alternatives."""
    replacements = {
        "\u2013": "-", "\u2014": "-", "\u2018": "'", "\u2019": "'",
        "\u201c": '"', "\u201d": '"', "\u2022": "-", "\u2026": "...",
        "\u00b7": "-", "\uf0b7": "-",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text.encode("latin-1", errors="replace").decode("latin-1")


def _parse_lines(resume_text: str) -> list[dict]:
    """Parse resume text into structured lines with types."""
    lines = resume_text.split("\n")
    parsed = []
    is_first = True

    section_names = {
        "SUMMARY", "EXPERIENCE", "WORK EXPERIENCE", "EDUCATION",
        "SKILLS", "CERTIFICATIONS", "QUALIFICATIONS", "PROJECTS",
        "PROFESSIONAL EXPERIENCE", "TECHNICAL SKILLS", "AWARDS",
        "PROFESSIONAL SUMMARY", "CORE COMPETENCIES", "OBJECTIVE",
    }

    for line in lines:
        stripped = line.strip()
        if not stripped:
            parsed.append({"type": "blank", "text": ""})
            continue

        safe = _safe(stripped)

        if is_first:
            parsed.append({"type": "name", "text": safe})
            is_first = False
        elif len(parsed) <= 3 and ("@" in stripped or "|" in stripped or "linkedin" in stripped.lower()):
            parsed.append({"type": "contact", "text": safe})
        elif (stripped.isupper() and len(stripped) < 60) or stripped.upper().rstrip(":") in section_names:
            parsed.append({"type": "header", "text": safe.upper()})
        elif stripped.startswith(("-", "*", "\u2022", "\uf0b7")):
            parsed.append({"type": "bullet", "text": _safe(stripped.lstrip("-*\u2022\uf0b7 "))})
        elif "|" in stripped and len(stripped) < 120:
            parsed.append({"type": "jobtitle", "text": safe})
        else:
            parsed.append({"type": "text", "text": safe})

    return parsed


# ─── TEMPLATE: CLASSIC ────────────────────────────────────────
def _render_classic(resume_text: str) -> bytes:
    """Traditional resume — serif-like feel, clean lines under headers."""
    pdf = FPDF(format="letter")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()
    m = 20
    pdf.set_left_margin(m)
    pdf.set_right_margin(m)
    w = pdf.w - m * 2
    parsed = _parse_lines(resume_text)

    for item in parsed:
        t, text = item["type"], item["text"]
        pdf.set_x(m)

        if t == "blank":
            pdf.ln(3)
        elif t == "name":
            pdf.set_font("Helvetica", "B", 20)
            pdf.cell(w, 10, text, align="C", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(1)
        elif t == "contact":
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(80, 80, 80)
            pdf.cell(w, 5, text, align="C", new_x="LMARGIN", new_y="NEXT")
            pdf.set_text_color(0, 0, 0)
            pdf.ln(1)
        elif t == "header":
            pdf.ln(3)
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(w, 6, text, new_x="LMARGIN", new_y="NEXT")
            y = pdf.get_y()
            pdf.set_draw_color(0, 0, 0)
            pdf.set_line_width(0.5)
            pdf.line(m, y, m + w, y)
            pdf.set_line_width(0.2)
            pdf.ln(3)
        elif t == "jobtitle":
            pdf.set_font("Helvetica", "B", 10)
            pdf.multi_cell(w, 5.5, text, align="L")
            pdf.ln(1)
        elif t == "bullet":
            pdf.set_font("Helvetica", "", 9.5)
            bullet_indent = 8
            pdf.set_x(m + bullet_indent)
            pdf.cell(4, 5, "-")
            pdf.multi_cell(w - bullet_indent - 4, 5, text, align="L")
            pdf.ln(0.5)
        else:
            pdf.set_font("Helvetica", "", 9.5)
            pdf.multi_cell(w, 5, text, align="L")
            pdf.ln(0.5)

    return pdf.output()


# ─── TEMPLATE: MODERN ─────────────────────────────────────────
def _render_modern(resume_text: str) -> bytes:
    """Modern resume — accent color, bold header bar, contemporary feel."""
    pdf = FPDF(format="letter")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()
    m = 18
    pdf.set_left_margin(m)
    pdf.set_right_margin(m)
    w = pdf.w - m * 2
    parsed = _parse_lines(resume_text)

    # Accent color: deep blue
    accent = (41, 65, 122)

    for item in parsed:
        t, text = item["type"], item["text"]
        pdf.set_x(m)

        if t == "blank":
            pdf.ln(3)
        elif t == "name":
            pdf.set_font("Helvetica", "B", 22)
            pdf.set_text_color(*accent)
            pdf.cell(w, 11, text, align="L", new_x="LMARGIN", new_y="NEXT")
            pdf.set_text_color(0, 0, 0)
            # Accent bar
            y = pdf.get_y() + 1
            pdf.set_fill_color(*accent)
            pdf.rect(m, y, w, 1.5, "F")
            pdf.ln(5)
        elif t == "contact":
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(100, 100, 100)
            pdf.cell(w, 5, text, align="L", new_x="LMARGIN", new_y="NEXT")
            pdf.set_text_color(0, 0, 0)
            pdf.ln(1)
        elif t == "header":
            pdf.ln(4)
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_text_color(*accent)
            pdf.cell(w, 6, text, new_x="LMARGIN", new_y="NEXT")
            pdf.set_text_color(0, 0, 0)
            y = pdf.get_y()
            pdf.set_draw_color(*accent)
            pdf.set_line_width(0.8)
            pdf.line(m, y, m + 40, y)  # Short accent line
            pdf.set_line_width(0.2)
            pdf.ln(3)
        elif t == "jobtitle":
            pdf.set_font("Helvetica", "B", 10)
            pdf.multi_cell(w, 5.5, text, align="L")
            pdf.ln(1)
        elif t == "bullet":
            pdf.set_font("Helvetica", "", 9.5)
            bullet_indent = 6
            pdf.set_x(m + bullet_indent)
            # Colored bullet dot
            y_dot = pdf.get_y() + 2
            pdf.set_fill_color(*accent)
            pdf.circle(m + bullet_indent - 1, y_dot, 1, "F")
            pdf.multi_cell(w - bullet_indent, 5, text, align="L")
            pdf.ln(0.5)
        else:
            pdf.set_font("Helvetica", "", 9.5)
            pdf.multi_cell(w, 5, text, align="L")
            pdf.ln(0.5)

    return pdf.output()


# ─── TEMPLATE: MINIMAL ────────────────────────────────────────
def _render_minimal(resume_text: str) -> bytes:
    """Minimal resume — lots of whitespace, understated, elegant."""
    pdf = FPDF(format="letter")
    pdf.set_auto_page_break(auto=True, margin=25)
    pdf.add_page()
    m = 28
    pdf.set_left_margin(m)
    pdf.set_right_margin(m)
    w = pdf.w - m * 2
    parsed = _parse_lines(resume_text)

    for item in parsed:
        t, text = item["type"], item["text"]
        pdf.set_x(m)

        if t == "blank":
            pdf.ln(4)
        elif t == "name":
            pdf.ln(5)
            pdf.set_font("Helvetica", "", 24)
            pdf.cell(w, 12, text, align="C", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
        elif t == "contact":
            pdf.set_font("Helvetica", "", 8.5)
            pdf.set_text_color(120, 120, 120)
            pdf.cell(w, 4.5, text, align="C", new_x="LMARGIN", new_y="NEXT")
            pdf.set_text_color(0, 0, 0)
            pdf.ln(1)
        elif t == "header":
            pdf.ln(6)
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(120, 120, 120)
            # Spaced out letters for minimal look
            spaced = "  ".join(text)
            pdf.cell(w, 5, spaced, new_x="LMARGIN", new_y="NEXT")
            pdf.set_text_color(0, 0, 0)
            pdf.ln(3)
        elif t == "jobtitle":
            pdf.set_font("Helvetica", "B", 9.5)
            pdf.multi_cell(w, 5.5, text, align="L")
            pdf.ln(1)
        elif t == "bullet":
            pdf.set_font("Helvetica", "", 9)
            pdf.set_x(m + 4)
            pdf.multi_cell(w - 4, 5, text, align="L")
            pdf.ln(1)
        else:
            pdf.set_font("Helvetica", "", 9)
            pdf.multi_cell(w, 5, text, align="L")
            pdf.ln(0.5)

    return pdf.output()


# ─── PUBLIC API ────────────────────────────────────────────────

TEMPLATES = {
    "classic": _render_classic,
    "modern": _render_modern,
    "minimal": _render_minimal,
}


def export_resume_to_pdf(resume_text: str, template: str = "classic") -> bytes:
    """Export tailored resume text to PDF using the selected template."""
    renderer = TEMPLATES.get(template, _render_classic)
    return renderer(resume_text)


def export_cover_letter_to_pdf(cover_letter: str) -> bytes:
    """Export cover letter to a clean PDF."""
    pdf = FPDF(format="letter")
    pdf.set_auto_page_break(auto=True, margin=25)
    pdf.add_page()
    m = 30
    pdf.set_left_margin(m)
    pdf.set_right_margin(m)
    w = pdf.w - m * 2

    pdf.set_font("Helvetica", "", 11)

    paragraphs = cover_letter.split("\n")
    for para in paragraphs:
        stripped = para.strip()
        if not stripped:
            pdf.ln(6)
        else:
            pdf.set_x(m)
            pdf.multi_cell(w, 6, _safe(stripped), align="L")

    return pdf.output()
