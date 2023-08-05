function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

const StatusPill = ({ value }: any) => {
  const status = value ? value : "unknown";

  return (
    <span
      className={classNames(
        "leading-wide rounded-full px-3 py-1 text-xs font-bold uppercase shadow-sm",
        status.includes("ACTIVE") ? "bg-green-100 text-green-700" : null,
        status.includes("BLOCKED") ? "bg-red-100 text-red-700" : null
      )}
    >
      {status}
    </span>
  );
};

export default StatusPill;