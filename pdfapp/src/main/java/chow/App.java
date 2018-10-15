package chow;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Iterator;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDFieldTree;
import org.apache.pdfbox.pdmodel.interactive.form.PDTextField;

/**
 * PDF Investigation
 */
public class App {
    private static final String OUTPUT_FILE_NAME = "src/main/resources/filled_f1040.pdf";
    private static final String INPUT_FILE_NAME = "src/main/resources/f1040.pdf";
    private static final String OUTPUT_FILE_NAME2 = "src/main/resources/filled2_f1040.pdf";

    public static void main(String[] args) throws IOException {
        System.out.println( "Hello World!" );

        try (PDDocument pdfDocument = PDDocument.load(new File(INPUT_FILE_NAME))) {
        	
        	// Trying to figure out where the Adobe DS is.
        	System.out.println("Security: " + pdfDocument.getEncryption());
        	pdfDocument.setAllSecurityToBeRemoved(true);

        	// get the document catalog
            PDAcroForm acroForm = pdfDocument.getDocumentCatalog().getAcroForm();
            
            // as there might not be an AcroForm entry a null check is necessary
            if (acroForm != null) {
                PDFieldTree fieldTree = acroForm.getFieldTree();
                if (fieldTree != null) {
                	Iterator<PDField> i = fieldTree.iterator();
                    while (i.hasNext()) {
                        PDField field = i.next();
                        if (field.getValueAsString() != null && !field.getValueAsString().isEmpty()) {
	                        System.out.println("Found field: " + field.getFullyQualifiedName()
	                        + " - Value: " + field.getValueAsString());
                        }
                    }
                }
                
                // Doesn't work.
                for (PDField field : acroForm.getFields()) {
                    System.out.println("Found RAW field: " + field.getFullyQualifiedName());
                }
            }
            
            PDTextField field = (PDTextField) acroForm.getField( "topmostSubform[0].Page1[0].f1_05[0]" );
            field.setValue("Howard-Carter");
            
            // Save and close the filled out form.
            pdfDocument.save(OUTPUT_FILE_NAME);
            
            // Preserves encryption but doesn't save form fields
            pdfDocument.saveIncremental(new FileOutputStream(OUTPUT_FILE_NAME2));
        }
    }
}
