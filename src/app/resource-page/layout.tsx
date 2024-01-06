export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[calc(100vh-3.5rem)] mt-14">
      <div className="mx-auto my-0 max-w-[95vw] w-[900px] h-full">
        {children}
      </div>
    </div>
  );
}
