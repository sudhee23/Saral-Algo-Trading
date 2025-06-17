const Footer: React.FC = () => {
  return (
    <footer className="bg-[#001f3f] text-white text-center py-6 mt-10">
      <div className="max-w-screen-xl mx-auto px-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} ALTRA. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Built with ❤️ using Next.js & Tailwind CSS
        </p>
      </div>
    </footer>
  );
};

export default Footer;
