
'use server';
import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import type { Admission } from '@/types';

config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
});

const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const fromEmail = process.env.EMAIL_FROM_ADDRESS || `"PIISS Website" <${process.env.EMAIL_USER}>`;

export async function sendContactFormEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const { firstName, lastName, email, phone, subject, message } = data;

  try {
    // Email to admin
    await transporter.sendMail({
      from: fromEmail,
      to: adminEmail,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // Confirmation email to user
    await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject: "We've received your message!",
        html: `
            <h2>Thank You for Contacting Us!</h2>
            <p>Hi ${firstName},</p>
            <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
            <p><strong>Here's a copy of your message:</strong></p>
            <blockquote style="border-left: 2px solid #ccc; padding-left: 1em; margin-left: 1em;">
                <p><strong>Subject:</strong> ${subject}</p>
                <p>${message}</p>
            </blockquote>
            <p>Sincerely,<br/>The PIISS Team</p>
        `,
    });

    console.log('Contact form emails sent successfully.');
  } catch (error) {
    console.error('Error sending contact form email:', error);
    // In a real app, you might want to throw an error or handle it more gracefully
    // For now, we'll just log it to the server console.
  }
}

export async function sendAdmissionFormEmail(data: {
  applicantName: string;
  parentName: string;
  parentEmail: string;
  appliedClass: string;
}) {
  const { applicantName, parentName, parentEmail, appliedClass } = data;

  try {
     // Email to admin
    await transporter.sendMail({
      from: fromEmail,
      to: adminEmail,
      subject: `New Admission Application: ${applicantName}`,
      html: `
        <h2>New Admission Application Received</h2>
        <p><strong>Applicant Name:</strong> ${applicantName}</p>
        <p><strong>Applying for Class:</strong> ${appliedClass}</p>
        <p><strong>Parent Name:</strong> ${parentName}</p>
        <p><strong>Parent Email:</strong> ${parentEmail}</p>
        <p>Please review the full application in the admin dashboard.</p>
      `,
    });

    // Confirmation email to user
    await transporter.sendMail({
        from: fromEmail,
        to: parentEmail,
        subject: `Your Admission Application for ${applicantName} has been received!`,
        html: `
            <h2>Application Received!</h2>
            <p>Dear ${parentName},</p>
            <p>Thank you for submitting an admission application for <strong>${applicantName}</strong> for <strong>Class ${appliedClass}</strong>.</p>
            <p>We have successfully received your application. Our admissions team will review it and get in touch with you regarding the next steps.</p>
            <p>Sincerely,<br/>The PIISS Admissions Team</p>
        `,
    });

    console.log('Admission form emails sent successfully.');
  } catch (error) {
     console.error('Error sending admission form email:', error);
  }
}

export async function sendAdmissionApprovalEmail(data: Admission) {
  const { applicantName, parentName, parentEmail, appliedClass } = data;
  try {
    await transporter.sendMail({
        from: fromEmail,
        to: parentEmail,
        subject: `Congratulations! Admission for ${applicantName} has been Approved`,
        html: `
            <h2>Congratulations! Your child's admission has been approved.</h2>
            <p>Dear ${parentName},</p>
            <p>We are delighted to inform you that the admission for <strong>${applicantName}</strong> to <strong>Class ${appliedClass}</strong> has been approved.</p>
            <p>We will contact you shortly with information about the next steps, including enrollment details and orientation dates. Welcome to the PIISS family!</p>
            <p>Sincerely,<br/>The PIISS Admissions Team</p>
        `,
    });
  } catch (error) {
     console.error('Error sending admission approval email:', error);
     // Do not throw error, just log it.
  }
}

export async function sendAdmissionRejectionEmail(data: Admission) {
  const { applicantName, parentName, parentEmail, appliedClass } = data;
  try {
    await transporter.sendMail({
        from: fromEmail,
        to: parentEmail,
        subject: `Update on your admission application for ${applicantName}`,
        html: `
            <h2>Admission Application Update</h2>
            <p>Dear ${parentName},</p>
            <p>Thank you for your interest in PIISS and for submitting an application for <strong>${applicantName}</strong> for <strong>Class ${appliedClass}</strong>.</p>
            <p>After careful consideration, we regret to inform you that we are unable to offer a place at this time due to the high volume of applications and limited availability. We wish you the best in your search for a suitable school.</p>
            <p>Sincerely,<br/>The PIISS Admissions Team</p>
        `,
    });
  } catch (error) {
     console.error('Error sending admission rejection email:', error);
     // Do not throw error, just log it.
  }
}
