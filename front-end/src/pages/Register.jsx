export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        <input
          type="text"
          placeholder="Full name"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 border rounded-lg"
        />

        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
          Create account
        </button>
      </div>
    </div>
  );
}
