const Footer = () => {
  return (
    <footer
      style={{
        textAlign: "center",
        width: "100%",
        backgroundColor: "var(--secondary)",
        color: "black",
      }}
      className="footer dont-print"
    >
      <p style={{ margin: "7px" }}>
        ארזים 2007-2024 &copy; כל הזכויות שמורות. מלבד זכות השתיקה, היא שמורה
        למרקו (פוגו).
        <a
          className="link handle text-accent"
          href="/disclaimer"
          style={{ marginInlineEnd: 5 }}
        >
          הבהרה משפטית.
        </a>
        לפידבק,
        <a className="link handle text-accent" href="/contact-us">
          לחצו כאן.
        </a>
      </p>
    </footer>
  )
}

export default Footer
