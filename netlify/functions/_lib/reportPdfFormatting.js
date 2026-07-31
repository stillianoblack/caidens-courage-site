const BRAND = {
  navy: '#14345f',
  blue: '#2d5b9f',
  gold: '#d6a848',
  ink: '#213047',
  muted: '#5d6b7e',
  pale: '#f3f7fc',
  border: '#d7e1ed',
  white: '#ffffff',
};

function parseDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatReportDate(value) {
  const date = parseDate(value);
  if (!date) return null;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function formatReportingPeriod(start, end) {
  const startLabel = formatReportDate(start) || 'Start date not provided';
  const endLabel = formatReportDate(end) || formatReportDate(new Date());
  return `${startLabel} - ${endLabel}`;
}

function addReportFooters(doc, { scope, preparedAt, coverColor }) {
  const range = doc.bufferedPageRange();
  const prepared = formatReportDate(preparedAt) || formatReportDate(new Date());
  for (let page = range.start; page < range.start + range.count; page += 1) {
    doc.switchToPage(page);
    doc
      .font('Helvetica')
      .fontSize(7.4)
      .fillColor(page === range.start && coverColor ? coverColor : BRAND.muted)
      .text(
        `caidenscourage.com  |  Focus Flame Academy  |  ${scope}  |  Page ${page + 1} of ${range.count}  |  Prepared ${prepared}`,
        54,
        720,
        { width: 504, align: 'center', lineBreak: false },
      );
  }
}

function drawMetricCard(doc, { x, y, width, height = 72, label, value, note }) {
  doc.roundedRect(x, y, width, height, 10).fillAndStroke(BRAND.pale, BRAND.border);
  doc.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(18).text(String(value), x + 12, y + 12, {
    width: width - 24,
    height: 24,
  });
  doc.fillColor(BRAND.ink).font('Helvetica-Bold').fontSize(8.5).text(label, x + 12, y + 39, {
    width: width - 24,
    height: 18,
  });
  if (note) {
    doc.fillColor(BRAND.muted).font('Helvetica').fontSize(7).text(note, x + 12, y + 56, {
      width: width - 24,
      height: 12,
    });
  }
}

function drawSectionTitle(doc, title, eyebrow) {
  if (eyebrow) {
    doc.fillColor(BRAND.gold).font('Helvetica-Bold').fontSize(8).text(eyebrow.toUpperCase(), {
      characterSpacing: 1.1,
    });
    doc.moveDown(.3);
  }
  doc.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(19).text(title);
  doc.moveDown(.35);
  doc.moveTo(54, doc.y).lineTo(558, doc.y).lineWidth(1.5).strokeColor(BRAND.gold).stroke();
  doc.moveDown(.7);
}

module.exports = {
  BRAND,
  addReportFooters,
  drawMetricCard,
  drawSectionTitle,
  formatReportDate,
  formatReportingPeriod,
  parseDate,
};
