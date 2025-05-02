type Props = {
  title: string;
  children: React.ReactNode;
};

export default function WorkSection({ title, children }: Props) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div>{children}</div>
    </section>
  );
}