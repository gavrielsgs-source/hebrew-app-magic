import jsPDF from "jspdf";
import { SalesAgreementData } from "@/types/document-production";

// Add Hebrew font support (you may need to add a custom Hebrew font)
export async function generateSalesAgreementPDF(data: SalesAgreementData) {
  const doc = new jsPDF();
  
  // Set font for Hebrew (fallback to default for now)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const rightMargin = pageWidth - margin;
  
  // Helper function to add right-aligned Hebrew text
  const addRightAlignedText = (text: string, y: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, rightMargin - textWidth, y);
    return y + (fontSize * 0.4) + 2;
  };

  // Helper function to add centered text
  const addCenteredText = (text: string, y: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
    return y + (fontSize * 0.4) + 2;
  };

  // Title
  yPosition = addCenteredText("הסכם מכר", yPosition, 16);
  yPosition += 10;

  // Date and location
  yPosition = addRightAlignedText(`שנערך ונחתם במקום בתאריך ${data.date}`, yPosition);
  yPosition += 10;

  // Seller information
  yPosition = addRightAlignedText("בין:", yPosition, 14);
  yPosition = addRightAlignedText(`מר ${data.seller.company}`, yPosition);
  yPosition = addRightAlignedText(`ח.פ. ${data.seller.id}`, yPosition);
  yPosition = addRightAlignedText(`טל ${data.seller.phone}`, yPosition);
  yPosition = addRightAlignedText("כתובת:", yPosition);
  yPosition = addRightAlignedText(`${data.seller.address.street}, ${data.seller.address.city}, ${data.seller.address.country}`, yPosition);
  yPosition += 5;
  yPosition = addRightAlignedText('להלן "המוכר"', yPosition);
  yPosition += 10;

  // Buyer information
  yPosition = addRightAlignedText("לבין:", yPosition, 14);
  yPosition = addRightAlignedText(`מר ${data.buyer.name}`, yPosition);
  if (data.buyer.id) {
    yPosition = addRightAlignedText(`ת.ז. ${data.buyer.id}`, yPosition);
  }
  if (data.buyer.phone) {
    yPosition = addRightAlignedText(`טל ${data.buyer.phone}`, yPosition);
  }
  if (data.buyer.address) {
    yPosition = addRightAlignedText(`כתובת: ${data.buyer.address}`, yPosition);
  }
  yPosition += 5;
  yPosition = addRightAlignedText('להלן "הקונה"', yPosition);
  yPosition += 15;

  // Car information (if provided)
  if (data.car) {
    yPosition = addRightAlignedText("המוכר הסכים למכור לקונה והקונה הסכים לקנות מהמוכר את המכונית מסוג:", yPosition);
    yPosition = addRightAlignedText(`תוצר: ${data.car.make} דגם: ${data.car.model}`, yPosition);
    if (data.car.licenseNumber) {
      yPosition = addRightAlignedText(`מס' רישוי: ${data.car.licenseNumber}`, yPosition);
    }
    if (data.car.chassisNumber) {
      yPosition = addRightAlignedText(`מס' שילדה: ${data.car.chassisNumber}`, yPosition);
    }
    yPosition = addRightAlignedText(`שנת ייצור: ${data.car.year}`, yPosition);
    yPosition = addRightAlignedText(`מד אוץ: ${data.car.mileage.toLocaleString()}`, yPosition);
    yPosition = addRightAlignedText(`יד: ${data.car.hand}`, yPosition);
    yPosition = addRightAlignedText(`מקוריות: ${data.car.originality}`, yPosition);
    yPosition += 5;
    yPosition = addRightAlignedText('להלן "המכונית"', yPosition);
    yPosition += 10;
  }

  // Legal declaration
  const declaration = "המוכר מצהיר כי לאחר שבדק במשרד הרישוי מצא כי המכונית נקיה מכל חוב או שיעבוד או עיקול או צד ג' כלשהן.";
  yPosition = addRightAlignedText(declaration, yPosition);
  const declaration2 = "והיה בזמן כלשהו מתברר כי על המכונית רובץ מכל הנזכר להעיל,מתחייב המוכר לנקוט בהליכים משפטיים ע\"מ להמציא לקונה את שחרורו.";
  yPosition = addRightAlignedText(declaration2, yPosition);
  yPosition += 10;

  // Financial terms
  yPosition = addRightAlignedText(`תמורת המכונית ישלם הקונה למוכר ${data.financial.totalPrice.toLocaleString()} ש"ח`, yPosition);
  yPosition += 5;
  yPosition = addRightAlignedText("התנאים כדלקמן:", yPosition);
  yPosition = addRightAlignedText(`עם חתימת הסכם זה סך: ${data.financial.downPayment.toLocaleString()} ש"ח`, yPosition);
  
  if (data.financial.specialTerms) {
    yPosition = addRightAlignedText(`תנאים מיוחדים: ${data.financial.specialTerms}`, yPosition);
  }
  yPosition += 15;

  // Standard contract terms
  const terms = [
    "המכונית הינה רכוש המוכר עד פרעון התשלום האחרון.המוכר שומר לעצמו את הזכות לקחת מהקונה את המכונית ללא הודעה מוקדמת , במידה והקונה לא עמד בתנאי התשלום או המחאותיו לא כובדו על ידי הבנק.",
    "הקונה אינו רשאי לבטל את ההסכם ,ואולם אם בהסכמת המוכר יבטל הקונה את הסכם יוחזרו לו הסכומים ששילם ללא הצמדה וריבית ,בניקוי הוצאות המוכר.",
    "העברת בעלות על שם הקונה עם גמר התשלום.",
    "הקונה מצהיר כי המוכר הסביר את מצבה הכללי של המכונית ככל הידוע לו, ולאחר שהבין את דבריו, בדק את המכונית.",
    "כל המיסים והאגרות והקנסות והתשלומים מכל סוג שהוא החלים על הרכב או על השימוש בו, מיום מסירת החזקה ברכב לקונה ואילך, יחולו על הקונה במלואם.",
    "הקונה מצהיר כח המכונית לשביעות רצונו המלאה.",
    "מקום השיפוט היחיד בכל הנוגע לביצוע או הפרת חוזה זה נקבע בזה בבית המשפט המוסמך."
  ];

  terms.forEach((term, index) => {
    // Check if we need a new page
    if (yPosition > doc.internal.pageSize.height - 30) {
      doc.addPage();
      yPosition = 20;
    }
    
    yPosition = addRightAlignedText(`${index + 1}. ${term}`, yPosition, 10);
    yPosition += 5;
  });

  // Privacy notice
  yPosition += 10;
  const privacy1 = "* אני מאשר בזאת כי המידע שמסרתי ישמר במאגר הלקוחות וייאסף במסגרת התקשרותי עם החברה";
  const privacy2 = "* אני מסכים ומאשר לקבל הטבות עדכונים סקירות מקצועיות והצעות למוצרים ומבצעים או שירותים נוספים באמצעות דוא\"ל ומסרונים";
  
  yPosition = addRightAlignedText(privacy1, yPosition, 8);
  yPosition = addRightAlignedText(privacy2, yPosition, 8);

  // Save the PDF
  const fileName = `הסכם_מכר_${data.buyer.name}_${new Date().toLocaleDateString('he-IL').replace(/\//g, '_')}.pdf`;
  doc.save(fileName);
}