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
        ארזים 2007-2023 &copy; כל הזכויות שמורות. מלבד זכות השתיקה, היא שמורה
        למרקו.
        <a className="link handle text-accent" href="/disclaimer">
          הבהרה משפטית.
        </a>
      </p>
    </footer>
  )
}

export default Footer
