export const DEFAULT_CAMPAIGN_DOMAIN = "valdineisouzaimoveis.com.br";

export const DEFAULT_CAMPAIGN_BASE_URL = `https://${DEFAULT_CAMPAIGN_DOMAIN}`;

export const CAMPAIGN_PRESETS = [
	{
		label: "Instagram",
		source: "instagram",
		medium: "social",
		campaign: "instagram",
		destinationPath: "/contato",
	},
	{
		label: "Facebook",
		source: "facebook",
		medium: "social",
		campaign: "facebook",
		destinationPath: "/contato",
	},
	{
		label: "WhatsApp",
		source: "whatsapp",
		medium: "message",
		campaign: "whatsapp",
		destinationPath: "/contato",
	},
	{
		label: "LinkedIn",
		source: "linkedin",
		medium: "social",
		campaign: "linkedin",
		destinationPath: "/servicos",
	},
	{
		label: "YouTube",
		source: "youtube",
		medium: "video",
		campaign: "youtube",
		destinationPath: "/",
	},
];

export const normalizeCampaignSlug = (value = "") =>
	String(value)
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

export const normalizeDestinationPath = (value = "") => {
	const trimmedValue = String(value).trim();

	if (!trimmedValue) {
		return "/";
	}

	try {
		if (/^https?:\/\//i.test(trimmedValue)) {
			const url = new URL(trimmedValue);

			return `${url.pathname}${url.search}${url.hash}` || "/";
		}
	} catch {
		// Fallback to the raw value below.
	}

	const path = trimmedValue.startsWith("/") ? trimmedValue : `/${trimmedValue}`;

	return path || "/";
};

export const buildCampaignUrl = ({
	destinationPath,
	source,
	medium,
	campaign,
	content = "",
	term = "",
}) => {
	const url = new URL(normalizeDestinationPath(destinationPath), DEFAULT_CAMPAIGN_BASE_URL);

	const trackingParams = [
		["utm_source", source],
		["utm_medium", medium],
		["utm_campaign", campaign],
		["utm_content", content],
		["utm_term", term],
	];

	trackingParams.forEach(([key, value]) => {
		const sanitizedValue = String(value || "").trim();

		if (sanitizedValue) {
			url.searchParams.set(key, sanitizedValue);
		}
	});

	return url.toString();
};

export const createPresetState = (preset) => ({
	title: preset.label,
	source: preset.source,
	medium: preset.medium,
	campaign: preset.campaign,
	destinationPath: preset.destinationPath,
	content: "",
	term: "",
});

export const getInitialCampaignForm = () => ({
	title: "",
	source: "instagram",
	medium: "social",
	campaign: "",
	destinationPath: "/contato",
	content: "",
	term: "",
});
