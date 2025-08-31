interface FaqItemProps {
  faq: {
    question: string;
    answer: string;
  };
}

export const FaqItem = ({ faq }: FaqItemProps) => {
  return (
    <div className="border-b border-border pb-4">
      <h3 className="font-semibold text-lg">{faq.question}</h3>
      <p className="mt-2 text-muted-foreground text-sm sm:text-md">
        {faq.answer}
      </p>
    </div>
  );
};
