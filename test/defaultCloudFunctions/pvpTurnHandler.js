var theEnd = ((args.theModel.model.plrAsq === 14 && args.isA) || (args.theModel.model.plrBsq === 14 && !args.isA));
if(args.isA){
    args.theModel.model.plrAsq++;
    if(!theEnd){
        if(args.theModel.model.plrB.alsoBot){
            PvpMessageHandler(args.theModel, { oppsq: args.theModel.model.plrAsq, m: args.theMessage });
        } else {
            PvpMessageHandler(args.theModel, undefined, { oppsq: args.theModel.model.plrAsq, m: args.theMessage });
        }
    }
} else {
    args.theModel.model.plrBsq++;
    if(!theEnd){
        PvpMessageHandler(args.theModel, { oppsq: args.theModel.model.plrBsq, m: args.theMessage });
    }
}
if(theEnd){
    let finalMessage = {
        gameIsOver: true,
        finalm: { m: args.theMessage, asq: args.theModel.model.plrAsq, bsq: args.theModel.model.plrBsq }
    };
    PvpMessageHandler(args.theModel, finalMessage, finalMessage);
}