import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';
import { coerce } from '@/common/coerce';

interface Response {
    cookies: string,
    token: number
}

const SchemaData = z.object({
    domain: coerce.string()
});

type Payload = z.infer<typeof SchemaData>;


export class GetCredentials extends OneBotAction<Payload, Response> {
    override actionName = ActionName.GetCredentials;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const cookiesObject = await this.core.apis.UserApi.getCookies(payload.domain);
        //把获取到的cookiesObject转换成 k=v; 格式字符串拼接在一起
        const cookies = Object.entries(cookiesObject).map(([key, value]) => `${key}=${value}`).join('; ');
        const bkn = cookiesObject?.['skey'] ? this.core.apis.WebApi.getBknFromCookie(cookiesObject) : '';
        return { cookies: cookies, token: +bkn };
    }
}
