export interface IChatMessage {
    userId: string;
    username: string;
    displayName: string;
    messageId: string;
    message: string;
    logoUrl: string;
    isMod: boolean;
    isVip: boolean;
    isSubscriber: boolean;
    isBroadcaster: boolean;
    isTeamMember: boolean;
    userTypes?: string;
    userTypeList?: string[];
    teamName: string;
    teamShoutoutEnabled: boolean;
    emotes?: {
      [emoteid: string]: string[];
    };
    expired?: boolean;
}