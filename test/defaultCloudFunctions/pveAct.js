if(++args.battleModel.currentTurn === args.battleModel.turnsToFinish){
    return PveActResponse(true, null, { over: true });
} else {
    return PveActResponse(false, args.battleModel, { okay: true, turn: args.battleModel.currentTurn });
}