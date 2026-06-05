export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
      <div className="text-center px-6">
        <h1
          className="text-2xl text-[#282828] mb-3"
          style={{ fontFamily: "'Cooper BT', serif" }}
        >
          Sign in failed
        </h1>
        <p className="text-[#b0a8a4] mb-6" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          Something went wrong during sign in. Please try again.
        </p>
        <a
          href="/"
          className="text-[#248179] underline"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          Back to home
        </a>
      </div>
    </div>
  );
}
