const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Designed and Developed by{' '}
            <a
              href="https://devai.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              DevAI Labs Computing
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
