import SiApple from "@icons-pack/react-simple-icons/icons/SiApple";
import SiDiscord from "@icons-pack/react-simple-icons/icons/SiDiscord";
import SiFacebook from "@icons-pack/react-simple-icons/icons/SiFacebook";
import SiGithub from "@icons-pack/react-simple-icons/icons/SiGithub";
import SiGitlab from "@icons-pack/react-simple-icons/icons/SiGitlab";
import SiSpotify from "@icons-pack/react-simple-icons/icons/SiSpotify";
import SiTwitch from "@icons-pack/react-simple-icons/icons/SiTwitch";
import SiX from "@icons-pack/react-simple-icons/icons/SiX";

import {
  GoogleLogo,
  LinkedInLogo,
  MicrosoftLogo,
  SlackLogo,
} from "@/ui/components/SocialLoginBrandIcons";

const surface = "border-input bg-background text-foreground enabled:hover:bg-accent";
const monochrome =
  "border-transparent bg-foreground text-background enabled:hover:bg-foreground/80";

export const socialLoginProviders = {
  apple: { brandClassName: monochrome, icon: SiApple, name: "Apple" },
  discord: {
    brandClassName:
      "border-transparent bg-[#5865f2] text-white enabled:hover:bg-[#4752c4]",
    icon: SiDiscord,
    name: "Discord",
  },
  facebook: {
    brandClassName:
      "border-transparent bg-[#0866ff] text-white enabled:hover:bg-[#0758dc]",
    icon: SiFacebook,
    name: "Facebook",
  },
  github: { brandClassName: monochrome, icon: SiGithub, name: "GitHub" },
  gitlab: { brandClassName: surface, icon: SiGitlab, name: "GitLab" },
  google: { brandClassName: surface, icon: GoogleLogo, name: "Google" },
  linkedin: {
    brandClassName:
      "border-transparent bg-[#0a66c2] text-white enabled:hover:bg-[#004182]",
    icon: LinkedInLogo,
    name: "LinkedIn",
  },
  microsoft: {
    brandClassName: surface,
    icon: MicrosoftLogo,
    name: "Microsoft",
  },
  slack: { brandClassName: surface, icon: SlackLogo, name: "Slack" },
  spotify: {
    brandClassName:
      "border-transparent bg-[#1ed760] text-black enabled:hover:bg-[#1bc457]",
    icon: SiSpotify,
    name: "Spotify",
  },
  twitch: {
    brandClassName:
      "border-transparent bg-[#9146ff] text-white enabled:hover:bg-[#772ce8]",
    icon: SiTwitch,
    name: "Twitch",
  },
  x: { brandClassName: monochrome, icon: SiX, name: "X" },
};

export type SocialLoginProvider = keyof typeof socialLoginProviders;
