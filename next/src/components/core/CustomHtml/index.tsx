export default function CustomHtml(props: CustomHtmlProps) {
  return <div dangerouslySetInnerHTML={{ __html: props.content }} />;
}
