import { useFormik } from "formik";
import * as Yup from "yup";
import logoImage from "/assets/images/sna h.png";
import { Link } from "react-router-dom";
import { IoHome } from "react-icons/io5";

/** أيقونات بسيطة SVG داخل الحقول */
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect
      x="4"
      y="10"
      width="16"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export function LoginPage() {
  const formik = useFormik({
    initialValues: { email: "", password: "", remember: false },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Enter a valid email")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Min 6 characters")
        .required("Password is required"),
      remember: Yup.boolean(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      // TODO: استبدلها بنداء الـ API الخاص بك
      await new Promise((r) => setTimeout(r, 700));
      console.log("LOGIN ->", values);
      setSubmitting(false);
    },
  });
  const err = (k) => formik.touched[k] && formik.errors[k];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--secondary-color)] to-[var(--primary-color)]/60 p-4">
      <Link
        to="/"
        title="Go Home"
        className="fixed top-5 left-5 flex items-center justify-center w-12 h-12 rounded-full 
             bg-white/20 backdrop-blur-md border border-white/30 text-white text-2xl 
             shadow-md hover:bg-[var(--primary-color)] hover:text-white 
             transition-all duration-300 z-50 animate-fadeIn"
      >
        <IoHome />
      </Link>
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT PANEL — gradient hero + capsules */}
        <div className="relative p-6 md:p-12 text-white flex items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)]/70 to-[var(--secondary-color)]"></div>

          {/* decorative capsules */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-10 w-28 rounded-full opacity-40 blur-[1px]"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.35), rgba(255,255,255,0.05))",
                  top: `${10 + i * 8}%`,
                  left: i % 2 === 0 ? `${-10 + i * 6}%` : `${30 + i * 5}%`,
                  transform: `rotate(${i % 2 === 0 ? -25 : 20}deg)`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <Link to="/">
              <img
                src={logoImage}
                alt="Logo"
                className="h-12 mb-6 drop-shadow-sm"
              />
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-sm">
              Welcome to website
            </h1>
            <p className="text-white/90 max-w-md leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam
              erat volutpat.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL — form */}
        <div className="bg-white p-4 md:p-12 flex flex-col justify-center">
          <h2 className="text-center text-xl md:text-2xl font-semibold text-[var(--secondary-color)] mb-8">
            LOGIN
          </h2>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <div
                className={[
                  "relative flex items-center rounded-full px-4",
                  "border",
                  err("email")
                    ? "border-red-400 focus-within:ring-2 focus-within:ring-red-400"
                    : "border-gray-200 focus-within:ring-2 focus-within:ring-[var(--primary-color)]",
                  "bg-gray-50",
                ].join(" ")}
              >
                <span className="text-gray-500 mr-2">
                  <UserIcon />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className="w-full bg-transparent outline-none py-3 px-2"
                />
              </div>
              {err("email") && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div
                className={[
                  "relative flex items-center rounded-full px-4",
                  "border",
                  err("password")
                    ? "border-red-400 focus-within:ring-2 focus-within:ring-red-400"
                    : "border-gray-200 focus-within:ring-2 focus-within:ring-[var(--primary-color)]",
                  "bg-gray-50",
                ].join(" ")}
              >
                <span className="text-gray-500 mr-2">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className="w-full bg-transparent outline-none py-3 px-2"
                />
              </div>
              {err("password") && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full mx-auto mt-2 rounded-full py-2.5 font-medium text-white transition
                         bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)]
                         hover:opacity-90 disabled:opacity-60"
            >
              {formik.isSubmitting ? "Signing in..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
