export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[calc(100vh-3.5rem)] mt-14 w-full">
      <div className="mx-auto my-0 w-full max-w-[1200px] h-full px-10">
        {children}
      </div>
    </div>
  );
}
