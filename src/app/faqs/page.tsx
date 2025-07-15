import React from "react";

const faqs = [
    {
        question: "How do I get started?",
        answer:
            "To get started, create an account and log in. Once logged in, you can explore the dashboard and access all features.",
    },
    {
        question: "How do I add a class session?",
        answer:
            "Navigate to the 'Classes' section, select your class, and click 'Add Session'. Fill in the session details and save.",
    },
    {
        question: "How do I track attendance?",
        answer:
            "Go to the session details and use the 'Attendance' tab to mark students present or absent. Attendance records are saved automatically.",
    },
];

export default function FaqsPage() {
    return (
        <main style={{ maxWidth: 600, margin: "2rem auto", padding: "1rem" }}>
            <h1>Frequently Asked Questions</h1>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {faqs.map((faq, idx) => (
                    <li key={idx} style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                            {faq.question}
                        </h2>
                        <p style={{ margin: 0 }}>{faq.answer}</p>
                    </li>
                ))}
            </ul>
        </main>
    );
}