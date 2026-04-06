// EmailJS configuration
// Setup: https://www.emailjs.com/
// 1. Create free account at emailjs.com
// 2. Add Email Service (Gmail/Outlook)
// 3. Create Email Template with variables:
//    {{to_email}}, {{to_name}}, {{test_date}}, {{course_name}}, {{test_link}}
// 4. Add to .env:
//    VITE_EMAILJS_SERVICE_ID=your_service_id
//    VITE_EMAILJS_TEMPLATE_ID=your_template_id
//    VITE_EMAILJS_PUBLIC_KEY=your_public_key

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

function isConfigured() {
  return SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY &&
    SERVICE_ID !== 'YOUR_SERVICE_ID' &&
    TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
    PUBLIC_KEY !== 'YOUR_PUBLIC_KEY'
}

export async function sendTestScheduleEmail({ toEmail, toName, testDate, courseName }) {
  if (!isConfigured()) {
    console.warn('EmailJS not configured. Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY to .env')
    return { success: false, error: 'EmailJS not configured' }
  }
  try {
    const emailjs = await import('@emailjs/browser')
    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email:    toEmail,
        to_name:     toName,
        test_date:   new Date(testDate).toLocaleDateString('en-PK', { weekday:'long', year:'numeric', month:'long', day:'numeric' }),
        course_name: courseName,
        test_link:   `${window.location.origin}/entry-test`,
      },
      PUBLIC_KEY
    )
    return { success: true, result }
  } catch (err) {
    console.error('Email error:', err)
    return { success: false, error: err.message }
  }
}
