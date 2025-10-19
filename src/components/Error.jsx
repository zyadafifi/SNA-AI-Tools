import { PropTypes } from "prop-types";

export const Error = ({ statusCode, errorMassage }) => {
  const getErrorMessage = (code) => {
    switch (code) {
      case 400:
        return "Bad Request. Please check your input.";
      case 401:
        return "Unauthorized. Please log in.";
      case 403:
        return "Forbidden. You don't have permission.";
      case 404:
        return "Not Found. The resource doesn't exist.";
      case 500:
        return "Internal Server Error. Please try again later.";
      default:
        return "An unexpected error occurred.";
    }
  };

  return (
    <div
      className="flex items-center content-center w-full"
      style={{ padding: "20px", minHeight: "60vh" }}
    >
      <div className="text-center w-full">
        <h2 className="text-red-600 text-5xl font-bold mb-5">Error</h2>
        <p className={`text-[var(--primary-color)] text-2xl font-bold`}>
          {errorMassage || getErrorMessage(statusCode)}
        </p>
      </div>
    </div>
  );
};

Error.propTypes = {
  statusCode: PropTypes.number,
  errorMassage: PropTypes.string,
};
