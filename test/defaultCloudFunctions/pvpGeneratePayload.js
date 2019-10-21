if(args.isA){
    PvpResponse({ some: 'payload a' });
} else if(args.isBot){
    PvpResponse({ some: 'payload b', alsoBot: true });
} else {
    PvpResponse({ some: 'payload b' });
}