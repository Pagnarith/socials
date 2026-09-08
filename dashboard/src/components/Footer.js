export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Homework Palette Social Ops · Publisher Chakriya &copy; {new Date().getFullYear()}
        {' · '}
        <a
          href="https://homework.chakriya.net/"
          className="underline hover:text-gray-700 dark:hover:text-gray-200"
        >
          homework.chakriya.net
        </a>
      </div>
    </footer>
  );
}
