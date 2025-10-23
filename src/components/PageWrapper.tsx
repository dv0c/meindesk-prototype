import { FC } from "react";

interface PageWrapperProps {
  action: React.ReactNode;
  children: React.ReactNode;
  title: string;
  description?: string;
}

const PageWrapper: FC<PageWrapperProps> = ({
  children,
  action,
  description,
  title,
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold md:text-4xl">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      <div id="page-wrapper" className="flex mt-10">
        {children}
      </div>
    </>
  );
};

export default PageWrapper;

const Boundaries = ({ children }: { children: React.ReactNode }) => {
  return <div className="max-w-5xl mx-auto">{children}</div>;
};
