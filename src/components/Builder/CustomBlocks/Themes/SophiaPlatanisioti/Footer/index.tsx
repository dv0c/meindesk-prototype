interface FooterProps {
    heading?: string;
    phone?: string;
    email?: string;
    facebook?: string;
}

const Footer = ({
    heading = "Σοφία Πλατανησιώτη - Σύμβουλος Ψυχικής Υγείας",
    phone = "+30 6947777532",
    email = "platanisiotisophia@gmail.com",
    facebook = "https://www.facebook.com/PlatanisiotiSophia"
}: FooterProps) => {
    return (
        <>
            <div className="bg-[#ccc0a8] truncate px-3 space-y-5 text-center py-10 text-[100%] font-normal text-[#5a5933]">
                <h1 className="">{heading}</h1>
                {phone && (
                    <h2 className="font-light text-xl">
                        <a href={`tel:${phone}`}>{phone}</a>
                    </h2>
                )}
                {email && (
                    <h2 className="font-light">{email}</h2>
                )}
                {facebook && (
                    <h2 className="overflow-hidden w-auto truncate">
                        Facebook:{" "}
                        <a
                            href={facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                        >
                            {facebook}
                        </a>
                    </h2>
                )}
            </div>
            <div className="py-2 text-center font- text-xs truncate  text-white bg-[#6d6a3d]">
                <h1>
                    Created and maintained by
                    <a
                        href="https://github.com/dv0c"
                        target="_blank"
                        rel="noreferrer"
                        className=" ml-1 underline"
                    >
                        Meindesk.
                    </a>
                </h1>
            </div>
        </>
    );
};

export default Footer;
