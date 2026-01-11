import PropTypes from "prop-types";

export const Loading = ({ height }) => {
  return (
    <div
      style={{ height: height || "65vh" }}
      className="flex items-center justify-center"
    >
      <div className="flex-col gap-4 w-full flex items-center justify-center ">
        <div
          style={{ borderTopColor: "var(--primary-color)" }}
          className="w-14 h-14 border-[5px] text-4xl animate-spin border-[var(--secondary-color)] flex items-center justify-center  rounded-full"
        />
        <div className="text-center text-[var(--secondary-color)]">
          Loading...
        </div>
      </div>
    </div>
  );
};

Loading.propTypes = {
  height: PropTypes.string,
};
