export const Preview = ({ html }) => {
  return (
    <div style={{ paddingTop: "12px" }}>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Preview</h3>
      <div style={{ border: "1px solid black" }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};
