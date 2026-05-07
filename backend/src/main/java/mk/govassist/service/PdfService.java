package mk.govassist.service;


import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import lombok.RequiredArgsConstructor;
import mk.govassist.dto.request.RequestDetailsDto;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
public class PdfService {

    public byte[] generateRequestPdf(RequestDetailsDto request) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        document.add(new Paragraph("GovAssist.AI - Request Details")
                .setBold().setFontSize(18));
        document.add(new LineSeparator(new SolidLine()));

        document.add(new Paragraph(" "));
        document.add(new Paragraph("Service: " + request.getServiceTitle()).setFontSize(12));
        document.add(new Paragraph("Title: " + request.getTitle()).setFontSize(12));
        document.add(new Paragraph("Description: " + request.getDescription()).setFontSize(12));
        document.add(new Paragraph("Status: " + request.getStatus()).setFontSize(12));
        document.add(new Paragraph("Applicant: " + request.getApplicantEmail()).setFontSize(12));
        document.add(new Paragraph("Submitted: " + request.getCreatedAt()).setFontSize(12));
        document.add(new Paragraph("Last Updated: " + request.getUpdatedAt()).setFontSize(12));

        if (request.getDocuments() != null && !request.getDocuments().isEmpty()) {
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Uploaded Documents:").setBold());
            request.getDocuments().forEach(doc ->
                    document.add(new Paragraph("- " + doc.getOriginalFileName()).setFontSize(11))
            );
        }

        document.close();
        return out.toByteArray();
    }
}