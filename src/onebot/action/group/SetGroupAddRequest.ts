import { OneBotAction } from '@/onebot/action/OneBotAction';
import { NTGroupRequestOperateTypes } from '@/core/types';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    flag: Type.Union([Type.String(), Type.Number()]),
    approve: Type.Optional(Type.Union([Type.Boolean(), Type.String()])),
    reason: Type.Optional(Type.Union([Type.String({ default: ' ' }), Type.Null()])),
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupAddRequest extends OneBotAction<Payload, null> {
    actionName = ActionName.SetGroupAddRequest;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const flag = payload.flag.toString();
        const approve = payload.approve?.toString() !== 'false';
        const reason = payload.reason ?? ' ';
        const invite_notify = this.obContext.apis.MsgApi.notifyGroupInvite.get(flag);
        const notify = invite_notify ?? await this.findNotify(flag);
        if (!notify) {
            throw new Error('No such request');
        }
        await this.core.apis.GroupApi.handleGroupRequest(
            notify,
            approve ? NTGroupRequestOperateTypes.KAGREE : NTGroupRequestOperateTypes.KREFUSE,
            reason,
        );
        return null;
    }

    private async findNotify(flag: string) {
        let notify = (await this.core.apis.GroupApi.getSingleScreenNotifies(false, 100)).find(e => e.seq == flag);
        if (!notify) {
            notify = (await this.core.apis.GroupApi.getSingleScreenNotifies(true, 100)).find(e => e.seq == flag);
        }
        return notify;
    }
}