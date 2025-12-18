UPDATE whatsapp_templates 
SET template_content = 'היי {{1}} ! 👋

קיבלנו את הפנייה שלך {{2}} וראינו שאתה מתעניין ברכב.

מתי תהיה זמין ל{{3}}? 📞

נשמח לעזור לך למצוא בדיוק מה שמתאים לך!

בברכה,
צוות המכירות',
updated_at = now()
WHERE facebook_template_name = 'potential_customer';