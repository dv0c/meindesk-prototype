export const addDomainToVercel = async (domain: string) => {
    return await fetch(
        `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains${process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ""
        }`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: domain,
                // Optional:Redirect to www or vice versa if needed, but for now standard adding
            }),
        }
    ).then((res) => res.json());
};

export const removeDomainFromVercel = async (domain: string) => {
    return await fetch(
        `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}${process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ""
        }`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
            },
        }
    ).then((res) => res.json());
};

export const getDomainResponse = async (domain: string) => {
    return await fetch(
        `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}${process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ""
        }`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
                "Content-Type": "application/json",
            },
        }
    ).then((res) => {
        return res.json();
    });
};

export const getConfigResponse = async (domain: string) => {
    return await fetch(
        `https://api.vercel.com/v6/domains/${domain}/config${process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ""
        }`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
                "Content-Type": "application/json",
            },
        }
    ).then((res) => res.json());
};

export const verifyDomain = async (domain: string) => {
    return await fetch(
        `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}/verify${process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ""
        }`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
                "Content-Type": "application/json",
            },
        }
    ).then((res) => res.json());
};
