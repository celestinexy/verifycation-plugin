import MysApi from '../../genshin/model/mys/mysApi.js'
import GsCfg from '../../genshin/model/gsCfg.js'
import lodash from 'lodash'
import NoteUser from '../../genshin/model/mys/NoteUser.js'
import MysUser from '../../genshin/model/mys/MysUser.js'
import DailyCache from '../../genshin/model/mys/DailyCache.js'
import common from '../../../lib/common/common.js'
import fetch from 'node-fetch'
import { Config } from '../model/config.js'


export default class MysInfo {
  static tips = '请先#绑定cookie\n发送【体力帮助】查看配置教程'

  constructor(e) {
    if (e) {
      this.e = e
      this.userId = String(e.user_id)
    }
    /** 当前查询原神uid */
    this.uid = ''
    /** 当前ck信息 */
    this.ckInfo = {
      ck: '',
      uid: '',
      qq: '',
      ltuid: '',
      type: ''
    }
    // ck对应MysUser对象
    this.ckUser = null
    this.auth = ['dailyNote', 'bbs_sign_info', 'bbs_sign_home', 'bbs_sign', 'ys_ledger', 'compute', 'avatarSkill', 'detail', 'blueprint', 'UserGame', 'deckList', 'avatar_cardList', 'action_cardList', 'avatarInfo']
  }

  static async init(e, api) {
    await MysInfo.initCache()

    let mysInfo = new MysInfo(e)

    let onlySelfCk = false

    if (mysInfo.checkAuth(api)) {
      /** 获取ck绑定uid */
      mysInfo.uid = await MysInfo.getSelfUid(e)
      // 标记需要自身ck
      onlySelfCk = true
    } else {
      /** 获取uid */
      mysInfo.uid = await MysInfo.getUid(e)
    }

    if (!mysInfo.uid) {
      e.noTips = true
      return false
    }

    if (!['1', '2', '5', '6', '7', '8', '9'].includes(String(mysInfo.uid)[0])) {
      // e.reply('只支持查询国服uid')
      return false
    }
    if (!['6', '7', '8', '9'].includes(String(mysInfo.uid)[0]) && api === 'useCdk') {
      e.reply('兑换码使用只支持国际服uid')
      return false
    }

    mysInfo.e.uid = mysInfo.uid

    /** 获取ck */
    await mysInfo.getCookie(e, onlySelfCk)

    /** 判断回复 */
    await mysInfo.checkReply()
    return mysInfo
  }

  /**
   * 获取UID
   * @param e
   * @param matchMsgUid 用于判断消息是否为uid数据
   * @returns {Promise<string|boolean|*|string>}
   */
  static async getUid(e, matchMsgUid = true) {
    let user = await NoteUser.create(e)
    if (e.uid && matchMsgUid) {
      /** 没有绑定的自动绑定 */
      return user.autoRegUid(e.uid, e)
    }

    let { msg = '', at = '' } = e
    if (!msg) return false

    let uid
    /** at用户 */
    if (at) {
      let atUser = await NoteUser.create(at)
      uid = atUser.getUid(e)
      if (uid) return String(uid)
      if (e.noTips !== true) e.reply('尚未绑定uid', false, { at })
      return false
    }

    let matchUid = (msg = '') => {
      let ret = /[125-9][0-9]{8}/g.exec(msg)
      if (!ret) return false
      return ret[0]
    }

    // 消息携带UID、当前用户UID、群名片携带UID 依次获取
    uid = matchUid(msg) || user.getUid(e) || matchUid(e.sender.card)
    if (!matchMsgUid) uid = user.getUid(e)
    if (uid) {
      /** 没有绑定的自动绑定 */
      return user.autoRegUid(uid, e)
    }

    if (e.noTips !== true) e.reply('请先#绑定uid', false, { at })

    return false
  }

  /**
   * 获取ck绑定uid
   * @param e
   * @returns {Promise<boolean|*>}
   */
  static async getSelfUid(e) {
    let { msg = '', at = '' } = e
    if (!msg) return false

    let user = await NoteUser.create(e)
    let selfUser = at ? await NoteUser.create(at) : user

    if (!selfUser.hasCk) {
      if (e.noTips !== true) e.reply('尚未绑定cookie', false, { at: selfUser.qq })
      return false
    }

    return selfUser.getUid(e)
  }

  /**
   * @param e
   * @param e.apiSync 多个请求时是否同步请求
   * @param e.noTips  是否回复提示，用于第一次调用才提示，后续不再提示
   * @param api
   * * `index` 米游社原神首页宝箱等数据
   * * `spiralAbyss` 原神深渊
   * * `character` 原神角色详情
   * * `dailyNote` 原神树脂
   * * `bbs_sign` 米游社原神签到
   * * `detail` 详情
   * * `ys_ledger` 札记
   * * `compute` 养成计算器
   * * `avatarSkill` 角色技能
   * @param data 查询数据data
   * @param option 配置
   * @param option.log 是否显示请求日志
   */
  static async get(e, api, data = {}, option = {}) {
    let mysInfo = await MysInfo.init(e, api)

    if (!mysInfo.uid || !mysInfo.ckInfo.ck) return false
    e.uid = mysInfo.uid

    let user = e.user?.getMysUser()
    let mysApi = new MysApi(mysInfo.uid, mysInfo.ckInfo.ck, option, e.isSr, user.device)

    let res
    if (lodash.isObject(api)) {
      let all = []
      /** 同步请求 */
      if (e.apiSync) {
        res = []
        for (let i in api) {
          res.push(await mysApi.getData(i, api[i]))
        }
      } else {
        lodash.forEach(api, (v, i) => {
          all.push(mysApi.getData(i, v))
        })
        res = await Promise.all(all)
      }

      for (let i in res) {
        res[i] = await mysInfo.checkCode(res[i], res[i].api, mysApi, api[res[i].api])

        if (res[i]?.retcode === 0) continue

        break
      }
    } else {
      res = await mysApi.getData(api, data)
      res = await mysInfo.checkCode(res, api, mysApi, data)
    }

    return res
  }

  /**
   * 初始化公共CK
   * @returns {Promise<void>}
   */
  static async initPubCk() {
    // 初始化公共CK
    let pubCount = 0
    let pubCks = GsCfg.getConfig('mys', 'pubCk') || []
    for (let ck of pubCks) {
      let pubUser = await MysUser.create(ck)
      if (pubUser) {
        let ret = await pubUser.initCache({ qq: 'pub' })
        if (ret) {
          pubCount++
        }
        if (pubCount >= 20) {
          break
        }
      }
    }
    logger.mark(`加载公共ck：${pubCount}个`)
  }

  /**
   * 初始化用户CK
   * 默认会将用户CK加入查询池
   * @returns {Promise<void>}
   */
  static async initUserCk() {
    // 初始化用户缓存
    let userCount = 0
    await MysUser.forEach(async (mys) => {
      let ret = await mys.initCache()
      if (ret) {
        userCount++
      }
    })
    logger.mark(`加载用户UID：${userCount}个，加入查询池`)
  }

  /**
   * 初始化缓存
   * @param force 若已经初始化是否强制初始化
   * @param clearData 强制初始化时是否清除已有数据 (刷新/重置)
   * @returns {Promise<boolean>}
   */
  static async initCache(force = false, clearData = false) {
    // 检查缓存标记
    let cache = DailyCache.create()
    if (!force && await cache.get('cache-ready')) {
      return true
    }
    await DailyCache.clearOutdatedData()

    if (clearData) {
      await MysUser.clearCache()
    }

    // 先初始化用户CK，减少一些公共CK中ltuid无法识别的情况
    await MysInfo.initUserCk()

    await cache.set('cache-ready', new Date() * 1)

    // 初始化公共ck
    await MysInfo.initPubCk()

    return true
  }

  static async getBingCkUid() {
    let res = await GsCfg.getBingCk()
    return { ...res.ck }
  }

  // 获取uid绑定的ck信息
  static async checkUidBing(uid, game = 'gs') {
    let ckUser = await MysUser.getByQueryUid(uid, game, true)
    if (ckUser && ckUser.ck) {
      return ckUser
    }
    return false
  }

  static async delDisable() {
    return await MysUser.delDisable()
  }

  /** 判断绑定ck才能查询 */
  checkAuth(api) {
    if (api === 'cookie') {
      return true
    }
    if (lodash.isObject(api)) {
      for (let i in api) {
        if (this.auth.includes(i)) {
          return true
        }
      }
    } else if (this.auth.includes(api)) {
      return true
    }
    return false
  }

  async checkReply() {
    if (this.e.noTips === true) return

    if (!this.uid) {
      this.e.reply('请先#绑定uid')
    }

    if (!this.ckInfo.ck) {
      this.e.reply('暂无可用CK，请绑定更多用户或设置公共ck..')
    }

    this.e.noTips = true
  }

  /* 获取请求所需ck */
  /**
   * 获取请求所需CK
   * @param game 游戏
   * @param onlySelfCk 是否只获取uid自己对应的ck。为true则只获取uid对应ck，若无则返回为空
   * @returns {Promise<string|string|*>} 查询ck，获取失败则返回空
   */
  async getCookie(game = 'gs', onlySelfCk = false) {
    if (this.ckUser?.ck) return this.ckUser?.ck

    let mysUser = await MysUser.getByQueryUid(this.uid, game, onlySelfCk)
    if (mysUser) {
      if (mysUser.ck) {
        this.ckInfo = mysUser.getCkInfo()
        this.ckUser = mysUser
        // 暂时直接记录请求uid，后期优化分析MysApi请求结果分状态记录结果
        await mysUser.addQueryUid(this.uid, game)
      } else {
        // 重新分配
        await mysUser.disable(game)
        return onlySelfCk ? '' : await this.getCookie(game)
      }
    }
    return this.ckUser?.ck
  }

  async checkCode(res, type, mysApi = {}, data = {}, isTask = false) {
    if (!res) {
      if (!isTask) this.e.reply('米游社接口请求失败，暂时无法查询')
      return false
    }

    res.retcode = Number(res.retcode)
    if (type === 'bbs_sign') {
      if ([-5003].includes(res.retcode)) {
        res.retcode = 0
      }
    }

    switch (res.retcode) {
      case 0:
        break
      case -1:
      case -100:
      case 1001:
      case 10001:
      case 10103:
        if (/(登录|login)/i.test(res.message)) {
          if (this.ckInfo.uid) {
            logger.mark(`[ck失效][uid:${this.uid}][qq:${this.userId}]`)
            if (!isTask) this.e.reply(`UID:${this.ckInfo.uid}，米游社cookie已失效`)
          } else {
            logger.mark(`[公共ck失效][ltuid:${this.ckInfo.ltuid}]`)
            if (!isTask) this.e.reply('米游社查询失败，请稍后再试')
          }
          if (!isTask) await this.delCk()
        } else {
          if (!isTask) this.e.reply(`米游社接口报错，暂时无法查询：${res.message}`)
        }
        break
      case 1008:
        if (!isTask) this.e.reply('\n请先去米游社绑定角色', false, { at: this.userId })
        break
      case 10101:
        if (!isTask) {
          await this.disableToday()
          this.e.reply('查询已达今日上限')
        }
        break
      case 10102:
        if (res.message === 'Data is not public for the user') {
          if (!isTask) this.e.reply(`\nUID:${this.uid}，米游社数据未公开`, false, { at: this.userId })
        } else {
          if (!isTask) this.e.reply(`uid:${this.uid}，请先去米游社绑定角色`)
        }
        break
      // 伙伴不存在~
      case -1002:
        if (res.api === 'detail') res.retcode = 0
        break
      case 1034:
        // 验证码
        let mysInfo = await MysInfo.init(this.e, mysApi)
        if (!mysInfo.uid || !mysInfo.ckInfo.ck) return false
        this.e.uid = mysInfo.uid
        let _MysApi = new MysApi(mysInfo.uid, mysInfo.ckInfo.ck, {}, this.e.isSr)

        logger.mark(`[米游社接口][${type}][uid:${this.uid}] 遇到验证码`)
        let challenge = await this.bbsGeetest(_MysApi)
        if (challenge) {
          const headers = {
            "x-rpc-challenge": challenge
          }
          let data = { headers }
          return _MysApi.getData(type, data, false)



        } else {
          logger.mark(`[米游社查询失败][uid:${this.uid}][qq:${this.userId}] 遇到验证码`)
          if (!isTask) this.e.reply('米游社查询遇到验证码，请稍后再试')
        }
        break

      default:
        if (!isTask) this.e.reply(`米游社接口报错，暂时无法查询：${res.message || 'error'}`)
        break
    }
    if (res.retcode !== 0) {
      logger.mark(`[mys接口报错]${JSON.stringify(res)}，uid：${this.uid}`)
    }
    // 添加请求记录
    if (!isTask) await this.ckUser.addQueryUid(this.uid)
    return res
  }

  // copy from csv
  async bbsGeetest(_MysApi) {
    if ((!Config.geeAddress  && !Config.checkAddress) === "") return ""
    try {
      let RES = await _MysApi.getData('createVerification')
      RES.data.uid = this.uid

      const targetUrl = Config.geeAddress.replace('{0}', RES.data.gt).replace('{1}', RES.data.challenge)

      const gettoken = await fetch(`${Config.jumpAddress}createverify`, {
        method: 'POST',
        body: JSON.stringify({
          url: targetUrl
        })
      })
      const token = await gettoken.json()
      const verifyurl = `${Config.jumpAddress}geetest?e=${token.token}`
      let ret
      ret = await this.e.reply('米游社接口遇见验证码，请在 2 分钟内通过以下地址完成验证！\n' + verifyurl, false, { recallMsg: 120 })

      /*let response = await fetch(targetUrl)
      if (!response.ok) {
        logger.error(`[validate][${this.uid}] ${response.status} ${response.statusText}`)
        return false
      }*/
      for (let n = 1; n < 120; n++) {
        await common.sleep(1000)
        try {
          let checkVerificationAddress = {
            url: Config.checkAddress,
            query: `callback=${RES.data.challenge}`,
          }

          const checkurl = checkVerificationAddress.url + '?' + checkVerificationAddress.query
          const check = await fetch(checkurl, {
            method: 'GET'
          })
          let res = await check.json()
          if (res.data) {
            if (res?.retcode !== 204) {
              logger.mark(`[米游社接口][uid:${this.uid || RES.data.uid}][qq: ${this.e.user_id}] 验证通过！`)
              if (this.e.group) {
                this.e.reply(`uid:${this.uid} 验证通过！`, true)
                await this.e.group.recallMsg(ret.message_id)
              } else if (this.e.isPrivate) {
                await this.e.friend.recallMsg(ret.message_id)
                this.e.reply(`uid:${this.uid}验证通过！`, true)
              }
              res = await _MysApi.getData("verifyVerification", res.data)
              return res.data.challenge
            }
          }
        } catch (err) {
          Bot.logger.error(`[validate][uid:${this.uid}] 出错：${err}`)
        }
      }
      await this.e.reply("验证码失败，请重试", true, { at: true })
      return false

    } catch (error) {
      //大概率是数据空导致报错这种情况很少见捏，所以你可以忽略不看
      Bot.logger.error(`[米游社接口][uid:${this.uid}] 出错：${error}`)
    }
    return false
  }

  /** 删除失效ck */
  async delCk() {
    if (!this.ckUser) {
      return false
    }
    let ckUser = this.ckUser
    // 删除记录，并清除对应user ck记录
    await ckUser.delWithUser()
  }

  /** 查询次数满，今日内标记失效 */
  async disableToday(game = 'gs') {
    /** 统计次数设为超限 */
    await this.ckUser.disable(game)
  }
}
