// ================================================================
// MP-Box 資安專家 — 展示資料層 (v74)
// 從 v73_claude.html 抽出，與 HTML 邏輯層分離
//
// 結構異動（v74）：
// - allIssues.suggests 從純字串陣列改為物件陣列 {text, refs, urgency}
// - allIssues.mitre 直接掛載，消除 allIssuesMeta / suggestRefs / suggestUrgency
// - allIssues.desc 縮短為 2 句摘要
// - allIssues.logs 每筆保留 1 筆代表性日誌
// ================================================================

// ─── 基礎設定 ───
let allPartners = [
    { id: 1, name: '資安專家', desc: '排程、資料來源（syslog-ng Store Box）', builtin: true, enabled: true }
];

let allUsers = [
    { id: 1, name: 'Rex Shen',    email: 'rexshen@mpinfo.com.tw',    roles: ['管理員'],     status: '啟用' },
    { id: 2, name: 'Robert Huang',email: 'roberthuang@mpinfo.com.tw', roles: ['一般使用者'], status: '啟用' },
    { id: 3, name: 'Pong Chang',  email: 'pongchang@mpinfo.com.tw',   roles: ['一般使用者'], status: '啟用' },
    { id: 4, name: 'Dama Wang',   email: 'damawang@mpinfo.com.tw',    roles: ['管理員'],     status: '啟用' },
    { id: 5, name: 'Frank Liu',   email: 'frankliu@mpinfo.com.tw',    roles: ['管理員'],     status: '停用' }
];

let allRoles = [
    { id: 1, name: '管理員',     partners: ['資安專家'], canAccessAI: true,  canManageAccounts: true,  canManageRoles: true,  canEditAI: true  },
    { id: 2, name: '一般使用者', partners: ['資安專家'], canAccessAI: true,  canManageAccounts: false, canManageRoles: false, canEditAI: false }
];

// ─── 安全事件清單 ───
// 來源：DB security_events + flash_results.events[*].logs（match_key 對應），匯入時間 2026-04-30
// 註：suggests urgency 依固定規則（5 條 → 最推薦x2 / 次推薦x2 / 可選）分配，DB 無 urgency 欄位
// 註：id 70/71/74 在 flash_results 對應 chunk 的 logs 為空陣列（PG 端只存 log_ids），雛型暫顯示 0 筆
const allIssues = [
    {
        id: 67,
        title: "大規模外部IP掃描內網211.21.43.0/24",
        starRank: 4,
        date: "2026-04-28",
        dateEnd: "2026-04-28",
        detectionCount: 80230,
        affectedSummary: "211.21.43.0/24子網",
        affected: "【異常發現】來自11,705個唯一外部IP發動80,230次拒絕連線，目標為內網211.21.43.0/24子網，嘗試連接埠23、80、8080、3389、22，攻擊來源遍及德國、美國、荷蘭、英國等多國。\n【風險分析】大規模協調式掃描可能為APT前期偵查，若內網存在未修補漏洞，將面臨入侵風險。\n【攻擊來源】77.90.185.43、204.76.203.206、80.82.65.202、88.210.63.63、185.156.73.197等11,705個外部IP",
        currentStatus: "未處理",
        assignee: null,
        history: [],
        desc: "來自11,705個唯一外部IP對內網211.21.43.0/24子網發動80,230次連線嘗試，涉及多國攻擊來源，目標涵蓋多個常見服務埠，呈現協調式網路偵查特徵。",
        mitre: [
            {
                id: "T1595",
                name: "",
                url: "https://attack.mitre.org/techniques/T1595/"
            },
            {
                id: "T1046",
                name: "",
                url: "https://attack.mitre.org/techniques/T1046/"
            }
        ],
        suggests: [
            {
                urgency: "最推薦",
                text: "確認211.21.43.0/24子網對外暴露的服務清單",
                refs: []
            },
            {
                urgency: "最推薦",
                text: "評估防火牆規則是否已封鎖已知惡意IP段",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "對頻繁出現的外部攻擊IP申請IP黑名單更新",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "檢查邊界設備是否有自動封鎖規則觸發",
                refs: []
            },
            {
                urgency: "可選",
                text: "考慮部署蜜罐偵測持續掃描行為",
                refs: []
            }
        ],
        logs: [
            "[2026-04-01 17:25:20] host=mpidcfw id=813316447657130032\n<189>date=2026-04-01 time=17:25:19 devname=\"MPIDCFW\" devid=\"FGT60FTK23016189\" eventtime=1775035519618539459 tz=\"+0800\" logid=\"0001000014\" type=\"traffic\" subtype=\"local\" level=\"notice\" vd=\"root\" srcip=204.76.203.206 srcport=42685 srcintf=\"wan1\" srcintfrole=\"wan\" dstip=211.21.43.181 dstport=80 dstintf=\"root\" dstintfrole=\"undefined\" srccountry=\"Netherlands\" dstcountry=\"Taiwan\" sessionid=112671751 proto=6 action=\"deny\" policyid=0 policytype=\"local-in-policy\" service=\"HTTP\" trandisp=\"noop\" app=\"Web Management\" duration=0 sentbyte=0 rcvdbyte=0 sentpkt=0 rcvdpkt=0 appcat=\"unscanned\" crscore=5 cractio…(截斷)",
            "[2026-04-01 17:25:20] host=mpidcfw id=813316447657130069\n<189>date=2026-04-01 time=17:25:19 devname=\"MPIDCFW\" devid=\"FGT60FTK23016189\" eventtime=1775035519798480259 tz=\"+0800\" logid=\"0001000014\" type=\"traffic\" subtype=\"local\" level=\"notice\" vd=\"root\" srcip=77.90.185.52 srcport=42892 srcintf=\"wan1\" srcintfrole=\"wan\" dstip=211.21.43.180 dstport=53850 dstintf=\"root\" dstintfrole=\"undefined\" srccountry=\"Germany\" dstcountry=\"Taiwan\" sessionid=112671765 proto=6 action=\"deny\" policyid=0 policytype=\"local-in-policy\" service=\"tcp/53850\" trandisp=\"noop\" app=\"tcp/53850\" duration=0 sentbyte=0 rcvdbyte=0 sentpkt=0 rcvdpkt=0 appcat=\"unscanned\" crscore=5 craction=2…(截斷)",
            "[2026-04-01 17:25:22] host=mpidcfw id=813316447657130401\n<189>date=2026-04-01 time=17:25:22 devname=\"MPIDCFW\" devid=\"FGT60FTK23016189\" eventtime=1775035521098500500 tz=\"+0800\" logid=\"0001000014\" type=\"traffic\" subtype=\"local\" level=\"notice\" vd=\"root\" srcip=204.76.203.231 srcport=40895 srcintf=\"wan1\" srcintfrole=\"wan\" dstip=211.21.43.180 dstport=12449 dstintf=\"root\" dstintfrole=\"undefined\" srccountry=\"Netherlands\" dstcountry=\"Taiwan\" sessionid=112671867 proto=6 action=\"deny\" policyid=0 policytype=\"local-in-policy\" service=\"tcp/12449\" trandisp=\"noop\" app=\"tcp/12449\" duration=0 sentbyte=0 rcvdbyte=0 sentpkt=0 rcvdpkt=0 appcat=\"unscanned\" crscore=5 crac…(截斷)",
            "[2026-04-01 17:25:22] host=mpidcfw id=813316447657130453\n<189>date=2026-04-01 time=17:25:22 devname=\"MPIDCFW\" devid=\"FGT60FTK23016189\" eventtime=1775035521644669119 tz=\"+0800\" logid=\"0001000014\" type=\"traffic\" subtype=\"local\" level=\"notice\" vd=\"root\" srcip=79.124.59.78 srcport=61000 srcintf=\"wan1\" srcintfrole=\"wan\" dstip=211.21.43.178 dstport=34471 dstintf=\"root\" dstintfrole=\"undefined\" srccountry=\"Bulgaria\" dstcountry=\"Taiwan\" sessionid=112671893 proto=6 action=\"deny\" policyid=0 policytype=\"local-in-policy\" service=\"tcp/34471\" trandisp=\"noop\" app=\"tcp/34471\" duration=0 sentbyte=0 rcvdbyte=0 sentpkt=0 rcvdpkt=0 appcat=\"unscanned\" crscore=5 craction=…(截斷)",
            "[2026-04-01 17:25:23] host=mpidcfw id=813316447657130567\n<189>date=2026-04-01 time=17:25:23 devname=\"MPIDCFW\" devid=\"FGT60FTK23016189\" eventtime=1775035522586749160 tz=\"+0800\" logid=\"0001000014\" type=\"traffic\" subtype=\"local\" level=\"notice\" vd=\"root\" srcip=104.168.56.24 srcport=57639 srcintf=\"wan1\" srcintfrole=\"wan\" dstip=211.21.43.179 dstport=2375 dstintf=\"root\" dstintfrole=\"undefined\" srccountry=\"United States\" dstcountry=\"Taiwan\" sessionid=112671925 proto=6 action=\"deny\" policyid=0 policytype=\"local-in-policy\" service=\"tcp/2375\" trandisp=\"noop\" app=\"tcp/2375\" duration=0 sentbyte=0 rcvdbyte=0 sentpkt=0 rcvdpkt=0 appcat=\"unscanned\" crscore=5 cracti…(截斷)",
            "[2026-04-02 10:58:05] host=mpidcfw id=813317547163016198\n<189>date=2026-04-02 time=10:58:05 devname=\"MPIDCFW\" devid=\"FGT60FTK23016189\" eventtime=1775098685110814719 tz=\"+0800\" logid=\"0001000014\" type=\"traffic\" subtype=\"local\" level=\"notice\" vd=\"root\" srcip=176.65.148.70 srcport=44909 srcintf=\"wan1\" srcintfrole=\"wan\" dstip=211.21.43.180 dstport=55535 dstintf=\"root\" dstintfrole=\"undefined\" srccountry=\"Netherlands\" dstcountry=\"Taiwan\" sessionid=114529462 proto=6 action=\"deny\" policyid=0 policytype=\"local-in-policy\" service=\"tcp/55535\" trandisp=\"noop\" app=\"tcp/55535\" duration=0 sentbyte=0 rcvdbyte=0 sentpkt=0 rcvdpkt=0 appcat=\"unscanned\" crscore=5 cract…(截斷)",
            "[2026-04-02 10:58:05] host=mpidcfw id=813317547163016251\n<189>date=2026-04-02 time=10:58:05 devname=\"MPIDCFW\" devid=\"FGT60FTK23016189\" eventtime=1775098685344954759 tz=\"+0800\" logid=\"0001000014\" type=\"traffic\" subtype=\"local\" level=\"notice\" vd=\"root\" srcip=141.98.83.48 srcport=4874 srcintf=\"wan1\" srcintfrole=\"wan\" dstip=211.21.43.178 dstport=53 dstintf=\"root\" dstintfrole=\"undefined\" srccountry=\"Romania\" dstcountry=\"Taiwan\" sessionid=114529478 proto=17 action=\"deny\" policyid=0 policytype=\"local-in-policy\" service=\"DNS\" trandisp=\"noop\" app=\"Domain Name Server\" duration=0 sentbyte=0 rcvdbyte=0 sentpkt=0 rcvdpkt=0 appcat=\"unscanned\" crscore=5 craction=2…(截斷)",
            "[2026-04-02 10:58:07] host=mpidcfw id=813317547163016585\n<189>date=2026-04-02 time=10:58:07 devname=\"MPIDCFW\" devid=\"FGT60FTK23016189\" eventtime=1775098686848256259 tz=\"+0800\" logid=\"0001000014\" type=\"traffic\" subtype=\"local\" level=\"notice\" vd=\"root\" srcip=150.107.38.251 srcport=43508 srcintf=\"wan1\" srcintfrole=\"wan\" dstip=211.21.43.178 dstport=2003 dstintf=\"root\" dstintfrole=\"undefined\" srccountry=\"United States\" dstcountry=\"Taiwan\" sessionid=114529567 proto=6 action=\"deny\" policyid=0 policytype=\"local-in-policy\" service=\"tcp/2003\" trandisp=\"noop\" app=\"tcp/2003\" duration=0 sentbyte=0 rcvdbyte=0 sentpkt=0 rcvdpkt=0 appcat=\"unscanned\" crscore=5 cract…(截斷)"
        ],
        iocList: [
            "77.90.185.43",
            "204.76.203.206",
            "80.82.65.202",
            "88.210.63.63",
            "185.156.73.197",
            "88.210.63.122",
            "125.132.20.244",
            "95.85.244.136",
            "84.21.190.130",
            "79.124.49.194"
        ]
    },
    {
        id: 68,
        title: "外部Microsoft帳號協調登入攻擊",
        starRank: 4,
        date: "2026-04-28",
        dateEnd: "2026-04-28",
        detectionCount: 4347,
        affectedSummary: "MPDC19-01/HQ DC",
        affected: "【異常發現】兩個外部hotmail帳號從不同工作站對DC持續發起登入失敗：edward_chen76@hotmail.com來自MP0147-1(172.16.1.117)共4,343次；rael829@hotmail.com來自MP-JAMIE-01(172.16.1.114)。\n【風險分析】不同工作站使用不同外部帳號協調攻擊，可能表示多個內網工作站已遭入侵或被用作跳板，極高失敗次數顯示自動化暴力破解工具正在運作。\n【攻擊來源】172.16.1.117（MP0147-1）、172.16.1.114（MP-JAMIE-01）",
        currentStatus: "未處理",
        assignee: null,
        history: [],
        desc: "多個外部Microsoft個人帳號（edward_chen76、rael829）分別從不同工作站對內部DC發動大量登入嘗試，edward_chen76達4,343次失敗，顯示自動化工具介入。",
        mitre: [
            {
                id: "T1110.001",
                name: "",
                url: "https://attack.mitre.org/techniques/T1110/001/"
            },
            {
                id: "T1110",
                name: "",
                url: "https://attack.mitre.org/techniques/T1110/"
            },
            {
                id: "T1078",
                name: "",
                url: "https://attack.mitre.org/techniques/T1078/"
            },
            {
                id: "T1078.003",
                name: "",
                url: "https://attack.mitre.org/techniques/T1078/003/"
            }
        ],
        suggests: [
            {
                urgency: "最推薦",
                text: "立即隔離MP0147-1(172.16.1.117)及MP-JAMIE-01(172.16.1.114)進行鑑識",
                refs: []
            },
            {
                urgency: "最推薦",
                text: "在DC上設定政策封鎖外部Microsoft帳號登入",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "審查AD帳號策略，確認是否有帳號被鎖定",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "啟用MFA以防止憑證填充攻擊成功",
                refs: []
            },
            {
                urgency: "可選",
                text: "追蹤兩台工作站的登入記錄與安裝程式清單",
                refs: []
            }
        ],
        logs: [
            "[2026-04-02 12:08:42] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813317547159022894\nMicrosoftAccount\\edward_chen76@hotmail.com: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  edward_chen76@hotmail.com\r\n 帳戶網域:  MicrosoftAccount\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: MP0147-1\r\n 來源網路位址: 10.10.10.52\r\n 來源連接埠:  63940\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位顯…(截斷)",
            "[2026-04-28 09:05:45] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461305852\nMicrosoftAccount\\edward_chen76@hotmail.com: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  edward_chen76@hotmail.com\r\n 帳戶網域:  MicrosoftAccount\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: MP0147-1\r\n 來源網路位址: 172.16.1.117\r\n 來源連接埠:  50637\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位…(截斷)",
            "[2026-04-28 09:32:33] host=mpdc19-hq program=Microsoft_Windows_security_auditing. id=813346134462330810\nMicrosoftAccount\\edward_chen76@hotmail.com: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  edward_chen76@hotmail.com\r\n 帳戶網域:  MicrosoftAccount\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: MP0147-1\r\n 來源網路位址: 172.16.1.117\r\n 來源連接埠:  51251\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位…(截斷)",
            "[2026-04-28 09:32:33] host=mpdc19-hq program=Microsoft_Windows_security_auditing. id=813346134462330812\nMicrosoftAccount\\edward_chen76@hotmail.com: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  edward_chen76@hotmail.com\r\n 帳戶網域:  MicrosoftAccount\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: MP0147-1\r\n 來源網路位址: 172.16.1.117\r\n 來源連接埠:  51250\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位…(截斷)",
            "[2026-04-28 09:32:33] host=mpdc19-hq program=Microsoft_Windows_security_auditing. id=813346134462330814\nMicrosoftAccount\\edward_chen76@hotmail.com: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  edward_chen76@hotmail.com\r\n 帳戶網域:  MicrosoftAccount\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: MP0147-1\r\n 來源網路位址: 172.16.1.117\r\n 來源連接埠:  51252\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位…(截斷)",
            "[2026-04-28 09:32:33] host=mpdc19-hq program=Microsoft_Windows_security_auditing. id=813346134462330816\nMicrosoftAccount\\edward_chen76@hotmail.com: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  edward_chen76@hotmail.com\r\n 帳戶網域:  MicrosoftAccount\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: MP0147-1\r\n 來源網路位址: 172.16.1.117\r\n 來源連接埠:  51264\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位…(截斷)",
            "[2026-04-28 09:32:33] host=mpdc19-hq program=Microsoft_Windows_security_auditing. id=813346134462330818\nMicrosoftAccount\\edward_chen76@hotmail.com: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  edward_chen76@hotmail.com\r\n 帳戶網域:  MicrosoftAccount\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: MP0147-1\r\n 來源網路位址: 172.16.1.117\r\n 來源連接埠:  51266\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位…(截斷)",
            "[2026-04-28 09:43:33] host=mpdc19-hq program=Microsoft_Windows_security_auditing. id=813346134462418736\nMicrosoftAccount\\edward_chen76@hotmail.com: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  edward_chen76@hotmail.com\r\n 帳戶網域:  MicrosoftAccount\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: MP0147-1\r\n 來源網路位址: 172.16.1.117\r\n 來源連接埠:  62780\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位…(截斷)"
        ],
        iocList: [
            "172.16.1.117",
            "172.16.1.114"
        ]
    },
    {
        id: 69,
        title: "AMANDATUNG_MP域Administrator暴力破解",
        starRank: 4,
        date: "2026-04-28",
        dateEnd: "2026-04-28",
        detectionCount: 93,
        affectedSummary: "MPDC19-02 Administrator",
        affected: "【異常發現】AMANDATUNG_MP域Administrator帳號從172.17.1.57對MPDC19-02發動91次登入失敗（Event 4625），同時導致Guest帳號被AMANDATUNG_MP觸發鎖定（Event 4740），使用NTLM跨域驗證。\n【風險分析】跨域Administrator暴力破解具高風險，若成功可獲取高權限。Guest帳號連帶鎖定表明攻擊密度已觸發鎖定策略，需立即阻斷。\n【攻擊來源】172.17.1.57（AMANDATUNG_MP）",
        currentStatus: "未處理",
        assignee: null,
        history: [],
        desc: "AMANDATUNG_MP工作站從172.17.1.57對MPDC19-02發動91次Administrator帳號暴力破解，並連帶觸發Guest帳號鎖定，跨域高權限帳號遭攻擊風險極高。",
        mitre: [
            {
                id: "T1110.001",
                name: "",
                url: "https://attack.mitre.org/techniques/T1110/001/"
            },
            {
                id: "T1110",
                name: "",
                url: "https://attack.mitre.org/techniques/T1110/"
            },
            {
                id: "T1078",
                name: "",
                url: "https://attack.mitre.org/techniques/T1078/"
            },
            {
                id: "T1078.001",
                name: "",
                url: "https://attack.mitre.org/techniques/T1078/001/"
            },
            {
                id: "T1078.002",
                name: "",
                url: "https://attack.mitre.org/techniques/T1078/002/"
            }
        ],
        suggests: [
            {
                urgency: "最推薦",
                text: "立即封鎖172.17.1.57的跨域登入嘗試",
                refs: []
            },
            {
                urgency: "最推薦",
                text: "審查AMANDATUNG_MP域與主域間的信任關係",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "確認AMANDATUNG_MP\\Administrator帳號的合法性",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "強制啟用帳號鎖定政策並縮短閾值",
                refs: []
            },
            {
                urgency: "可選",
                text: "調查AMANDATUNG_MP工作站是否已遭入侵",
                refs: []
            }
        ],
        logs: [
            "[2026-04-02 11:01:28] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813317547159012802\nAMANDATUNG_MP\\Administrator: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  Administrator\r\n 帳戶網域:  AMANDATUNG_MP\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: AMANDATUNG_MP\r\n 來源網路位址: 172.17.1.57\r\n 來源連接埠:  60351\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位顯示要求登入的本機系統上的帳戶。這通常是發生在服務 …(截斷)",
            "[2026-04-02 11:06:56] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813317547159013743\nAMANDATUNG_MP\\Administrator: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  Administrator\r\n 帳戶網域:  AMANDATUNG_MP\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: AMANDATUNG_MP\r\n 來源網路位址: 172.17.1.57\r\n 來源連接埠:  60491\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位顯示要求登入的本機系統上的帳戶。這通常是發生在服務 …(截斷)",
            "[2026-04-02 11:11:11] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813317547159014383\nAMANDATUNG_MP\\Administrator: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  Administrator\r\n 帳戶網域:  AMANDATUNG_MP\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: AMANDATUNG_MP\r\n 來源網路位址: 172.17.1.57\r\n 來源連接埠:  60577\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位顯示要求登入的本機系統上的帳戶。這通常是發生在服務 …(截斷)",
            "[2026-04-02 11:12:32] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813317547159014614\nAMANDATUNG_MP\\Administrator: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  Administrator\r\n 帳戶網域:  AMANDATUNG_MP\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: AMANDATUNG_MP\r\n 來源網路位址: 172.17.1.57\r\n 來源連接埠:  60615\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位顯示要求登入的本機系統上的帳戶。這通常是發生在服務 …(截斷)",
            "[2026-04-02 11:17:50] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813317547159015351\nAMANDATUNG_MP\\Administrator: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  Administrator\r\n 帳戶網域:  AMANDATUNG_MP\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: AMANDATUNG_MP\r\n 來源網路位址: 172.17.1.57\r\n 來源連接埠:  60702\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位顯示要求登入的本機系統上的帳戶。這通常是發生在服務 …(截斷)",
            "[2026-04-02 11:23:26] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813317547159016169\nAMANDATUNG_MP\\Administrator: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  Administrator\r\n 帳戶網域:  AMANDATUNG_MP\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: AMANDATUNG_MP\r\n 來源網路位址: 172.17.1.57\r\n 來源連接埠:  60784\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位顯示要求登入的本機系統上的帳戶。這通常是發生在服務 …(截斷)",
            "[2026-04-02 11:28:44] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813317547159016985\nAMANDATUNG_MP\\Administrator: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  Administrator\r\n 帳戶網域:  AMANDATUNG_MP\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC0000064\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: AMANDATUNG_MP\r\n 來源網路位址: 172.17.1.57\r\n 來源連接埠:  60883\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位顯示要求登入的本機系統上的帳戶。這通常是發生在服務 …(截斷)",
            "[2026-04-02 11:33:54] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813317547159017862\nMPINFO.COM.TW\\MSOL_2cd93d9077be: Security Microsoft Windows security auditing.: [Success Audit] 使用明確宣告的認證嘗試登入。\r\n\r\n主旨:\r\n 安全性識別碼:  MPINFO\\ADSyncMSA2cd93$\r\n 帳戶名稱:  ADSyncMSA2cd93$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x1FCCA\r\n 登入 GUID:  {6917bd66-fe87-60cd-8f59-df6509ed83f7}\r\n\r\n使用其認證的帳戶:\r\n 帳戶名稱:  MSOL_2cd93d9077be\r\n 帳戶網域:  MPINFO.COM.TW\r\n 登入 GUID:  {00000000-0000-0000-0000-000000000000}\r\n\r\n目標伺服器:\r\n 目標伺服器名稱: MPDC19-02.mpinfo.com.tw\r\n 其他資訊: ldap/MPDC19-02.mpinfo.com.tw/mpinfo.com.tw\r\n\r\n處理程序資訊:\r\n 處理程序識別碼:  0x12ec\r\n 處理程序名稱:  C:\\Program Files\\Microsoft Azure AD Sync\\Bin\\miiserver.exe\r\n\r\n網路資訊:\r\n 網路位址: -\r\n 連接埠:   …(截斷)"
        ],
        iocList: [
            "172.17.1.57"
        ]
    },
    {
        id: 70,
        title: "內網多協議廣播異常（mDNS/NetBIOS/LLMNR）",
        starRank: 3,
        date: "2026-04-28",
        dateEnd: "2026-04-28",
        detectionCount: 33251,
        affectedSummary: "192.168.10/50網段",
        affected: "【異常發現】多個內網主機向廣播地址發送大量協議廣播：mDNS(5353) 11,717次、NetBIOS(137) 10,792次、NetBIOS(138) 2,390次、LLMNR(5355) 2,828次、DHCPv6(547) 5,524次，來源涵蓋192.168.10.x、192.168.50.x及fe80::前綴IPv6地址。\n【風險分析】NetBIOS、mDNS、LLMNR廣播常被Responder等工具利用進行名稱解析欺騙以截取NTLM憑證，是橫向移動的常見前置步驟。",
        currentStatus: "未處理",
        assignee: null,
        history: [],
        desc: "多個內網主機持續發送mDNS、NetBIOS、LLMNR、DHCPv6廣播共33,251次，涉及192.168.10/50網段，可能為設備配置問題或中間人攻擊的前置條件。",
        mitre: [
            {
                id: "T1040",
                name: "",
                url: "https://attack.mitre.org/techniques/T1040/"
            },
            {
                id: "T1557",
                name: "",
                url: "https://attack.mitre.org/techniques/T1557/"
            }
        ],
        suggests: [
            {
                urgency: "最推薦",
                text: "評估在不影響業務前提下禁用LLMNR與NetBIOS over TCP/IP",
                refs: []
            },
            {
                urgency: "最推薦",
                text: "部署Responder偵測規則以識別中間人攻擊",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "確認廣播流量是否為設備正常需求或設定錯誤",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "審查IPv6配置，確認是否需要啟用DHCPv6",
                refs: []
            },
            {
                urgency: "可選",
                text: "設定防火牆規則限制廣播流量範圍",
                refs: []
            }
        ],
        logs: [],
        iocList: [
            "192.168.10.0/24",
            "192.168.50.0/24"
        ]
    },
    {
        id: 71,
        title: "192.168.10.4對內網主機SMB/RPC橫向偵查",
        starRank: 3,
        date: "2026-04-28",
        dateEnd: "2026-04-28",
        detectionCount: 24,
        affectedSummary: "192.168.10.253",
        affected: "【異常發現】192.168.10.4在19:49對192.168.10.253同時嘗試連接多個Windows高風險埠（135 RPC、445 SMB、139、137 NetBIOS），全部被防火牆拒絕，共24次連接嘗試。\n【風險分析】典型內網橫向移動偵查手法，攻擊者在取得初始立足點後掃描同網段主機的SMB/RPC服務，以尋找橫向擴散或憑證竊取機會。\n【攻擊來源】192.168.10.4",
        currentStatus: "未處理",
        assignee: null,
        history: [],
        desc: "192.168.10.4在短時間內嘗試連接192.168.10.253的多個高風險埠（135/RPC、445/SMB、139/137/NetBIOS），共24次，符合內網橫向移動前偵查特徵。",
        mitre: [
            {
                id: "T1046",
                name: "",
                url: "https://attack.mitre.org/techniques/T1046/"
            },
            {
                id: "T1570",
                name: "",
                url: "https://attack.mitre.org/techniques/T1570/"
            },
            {
                id: "T1021.002",
                name: "",
                url: "https://attack.mitre.org/techniques/T1021/002/"
            }
        ],
        suggests: [
            {
                urgency: "最推薦",
                text: "立即對192.168.10.4進行端點安全掃描",
                refs: []
            },
            {
                urgency: "最推薦",
                text: "檢查192.168.10.4的程序清單與網路連線記錄",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "確認192.168.10.253的重要性並加強存取控制",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "收集192.168.10.4的完整事件日誌進行鑑識分析",
                refs: []
            },
            {
                urgency: "可選",
                text: "評估是否需要隔離192.168.10.4直至調查完成",
                refs: []
            }
        ],
        logs: [],
        iocList: [
            "192.168.10.4"
        ]
    },
    {
        id: 72,
        title: "MP0443帳號多次失敗後遭鎖定",
        starRank: 3,
        date: "2026-04-28",
        dateEnd: "2026-04-28",
        detectionCount: 29,
        affectedSummary: "MP0443帳號",
        affected: "【異常發現】MPINFO\\MP0443帳號在MPDC19-01出現29次登入失敗（Event 4625），均來自svchost.exe程序，狀態碼0xC000006D/0xC000006A，最終觸發帳號鎖定（Event 4740）。\n【風險分析】若MP0443為服務帳號，密碼更改未同步將導致持續鎖定並影響服務運作；若為一般帳號，則可能遭到暴力破解嘗試。",
        currentStatus: "未處理",
        assignee: null,
        history: [],
        desc: "MPINFO\\MP0443在MPDC19-01上因svchost.exe發起的29次NTLM登入失敗觸發帳號鎖定，可能為密碼未同步的服務帳號或針對性暴力破解。",
        mitre: [
            {
                id: "T1110.001",
                name: "",
                url: "https://attack.mitre.org/techniques/T1110/001/"
            },
            {
                id: "T1110",
                name: "",
                url: "https://attack.mitre.org/techniques/T1110/"
            },
            {
                id: "T1078",
                name: "",
                url: "https://attack.mitre.org/techniques/T1078/"
            }
        ],
        suggests: [
            {
                urgency: "最推薦",
                text: "確認MP0443是服務帳號還是使用者帳號",
                refs: []
            },
            {
                urgency: "最推薦",
                text: "若為服務帳號，檢查所有使用該帳號的服務並更新密碼",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "解除帳號鎖定並監控是否再次觸發",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "審查帳號鎖定政策設定是否適當",
                refs: []
            },
            {
                urgency: "可選",
                text: "若確認為攻擊，追蹤svchost.exe的父程序與來源",
                refs: []
            }
        ],
        logs: [
            "[2026-04-28 09:15:19] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461307598\nMPINFO\\mp0443: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  mp0443\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 09:15:39] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461307635\nMPINFO\\mp0443: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  mp0443\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 09:15:40] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461307637\nMPINFO\\mp0443: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  mp0443\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 09:17:21] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461308021\nMPINFO\\mp0443: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  mp0443\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 09:17:24] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461308037\nMPINFO\\mp0443: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  mp0443\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 10:26:31] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461321540\nMPINFO\\mp0443: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  mp0443\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 10:26:51] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461321657\nMPINFO\\mp0443: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  mp0443\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 10:27:10] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461321790\nMPINFO\\mp0443: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  mp0443\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)"
        ],
        iocList: []
    },
    {
        id: 73,
        title: "多服務帳號CHAP驗證持續失敗",
        starRank: 3,
        date: "2026-04-28",
        dateEnd: "2026-04-28",
        detectionCount: 18,
        affectedSummary: "MP0259/MP0147/MP0004",
        affected: "【異常發現】三個域帳號（MP0259、MP0147、MP0004）在MPDC19-01/02由svchost.exe發起CHAP驗證失敗，共18次（MP0259: 8次、MP0147: 4次、MP0004: 6次），狀態碼均為0xC000006D/0xC000006A。\n【風險分析】多個服務帳號同時出現相同類型驗證失敗，強烈暗示系統配置問題而非攻擊，可能影響RAS、VPN或其他依賴這些帳號的服務正常運作。",
        currentStatus: "未處理",
        assignee: null,
        history: [],
        desc: "MP0259、MP0147、MP0004三個帳號均由svchost.exe透過CHAP協議驗證失敗，共18次，強烈暗示RAS/VPN服務帳號密碼未同步或配置錯誤。",
        mitre: [
            {
                id: "T1078",
                name: "",
                url: "https://attack.mitre.org/techniques/T1078/"
            },
            {
                id: "T1021",
                name: "",
                url: "https://attack.mitre.org/techniques/T1021/"
            }
        ],
        suggests: [
            {
                urgency: "最推薦",
                text: "識別使用MP0259、MP0147、MP0004的服務並確認其運作狀態",
                refs: []
            },
            {
                urgency: "最推薦",
                text: "檢查三個帳號的密碼是否一致且未過期",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "審查RAS/VPN服務配置，確認認證方式設定正確",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "考慮將CHAP認證改為更安全的認證方式",
                refs: []
            },
            {
                urgency: "可選",
                text: "監控這些帳號是否觸發帳號鎖定",
                refs: []
            }
        ],
        logs: [
            "[2026-04-28 09:36:26] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461312165\nMPINFO\\MP0259: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  MP0259\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 09:53:43] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461315610\nMPINFO\\MP0259: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  MP0259\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 09:53:45] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461315618\nMPINFO\\MP0259: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  MP0259\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 10:02:36] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461317405\nMPINFO\\MP0259: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  MP0259\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 10:19:24] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461320191\nMPINFO\\MP0259: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  MP0259\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 12:16:57] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461341707\nMPINFO\\MP0259: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  MP0259\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 12:24:08] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461342726\nMPINFO\\mp0443: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  mp0443\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)",
            "[2026-04-28 12:58:17] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461348271\nMPINFO\\MP0259: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  MP0259\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x8d0\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\svchost.exe\r\n\r\n網路資訊:\r\n 工作站名稱: -\r\n 來源網路位址: -\r\n 來源連接埠:  -\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  CHAP\r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r…(截斷)"
        ],
        iocList: []
    },
    {
        id: 74,
        title: "172.18.1.82持續嘗試連接非標準埠64943",
        starRank: 2,
        date: "2026-04-28",
        dateEnd: "2026-04-28",
        detectionCount: 15,
        affectedSummary: "172.18.1.82",
        affected: "【異常發現】172.18.1.82在超過6小時時間窗口內持續嘗試連接192.168.50.254的非標準高埠64943，共15次，全部被防火牆拒絕。該埠不屬於任何已知標準服務。\n【風險分析】持續嘗試連接非標準埠可能為惡意軟體的C2通訊測試、反向Shell或隧道建立嘗試，若連接成功建立可能導致資料外洩或持久化後門。",
        currentStatus: "未處理",
        assignee: null,
        history: [],
        desc: "172.18.1.82在超過6小時內（01:42~07:59）對192.168.50.254的非標準高埠64943發起15次連接嘗試，全部遭拒，可能為隧道測試或惡意C2通訊機制。",
        mitre: [
            {
                id: "T1571",
                name: "",
                url: "https://attack.mitre.org/techniques/T1571/"
            }
        ],
        suggests: [
            {
                urgency: "最推薦",
                text: "對172.18.1.82進行端點安全掃描與流量分析",
                refs: []
            },
            {
                urgency: "最推薦",
                text: "確認192.168.50.254上是否有服務監聽64943埠",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "收集172.18.1.82的完整網路連線與程序記錄",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "在防火牆新增告警規則監控對非標準高埠的連線嘗試",
                refs: []
            },
            {
                urgency: "可選",
                text: "評估是否為合法應用程式的配置問題",
                refs: []
            }
        ],
        logs: [],
        iocList: [
            "172.18.1.82"
        ]
    },
    {
        id: 75,
        title: "多域帳號零散登入失敗（MP0332/MP0026）",
        starRank: 2,
        date: "2026-04-28",
        dateEnd: "2026-04-28",
        detectionCount: 7,
        affectedSummary: "MP0332/MP0026",
        affected: "【異常發現】兩個域帳號出現零散登入失敗：MPINFO\\MP0332在MPDC19-01和MPDC19-02各有失敗記錄（共4次）；MPINFO\\MP0026在MPDC19-01有3次失敗，失敗原因均為密碼錯誤（0xC000006D/0xC000006A）。\n【風險分析】低頻失敗可能為帳號密碼過期、使用者輸入錯誤或服務帳號配置問題，亦不排除試探性憑證填充攻擊。",
        currentStatus: "未處理",
        assignee: null,
        history: [],
        desc: "MP0332在MPDC19-01/02出現4次登入失敗，MP0026在MPDC19-01出現3次登入失敗，均為密碼錯誤，低頻但需確認帳號狀態是否正常。",
        mitre: [
            {
                id: "T1078",
                name: "",
                url: "https://attack.mitre.org/techniques/T1078/"
            },
            {
                id: "T1110",
                name: "",
                url: "https://attack.mitre.org/techniques/T1110/"
            }
        ],
        suggests: [
            {
                urgency: "最推薦",
                text: "確認MP0332與MP0026的帳號狀態及密碼是否過期",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "詢問帳號持有者確認是否為本人操作",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "監控是否有後續登入失敗或鎖定事件",
                refs: []
            },
            {
                urgency: "可選",
                text: "確認帳號鎖定閾值設定是否合理",
                refs: []
            }
        ],
        logs: [
            "[2026-04-28 14:08:43] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461360773\nMPINFO\\MP0332: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  MP0332\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x304\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\lsass.exe\r\n\r\n網路資訊:\r\n 工作站名稱: MPDC19-01\r\n 來源網路位址: 192.168.10.22\r\n 來源連接埠:  58660\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  Advapi  \r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，…(截斷)",
            "[2026-04-28 14:08:43] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461360778\nMPINFO\\MP0332: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-01$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  MP0332\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x304\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\lsass.exe\r\n\r\n網路資訊:\r\n 工作站名稱: MPDC19-01\r\n 來源網路位址: 192.168.10.22\r\n 來源連接埠:  58670\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  Advapi  \r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，…(截斷)",
            "[2026-04-28 14:08:43] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813346134461360785\nMPINFO\\MP0332: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-02$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  MP0332\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x2fc\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\lsass.exe\r\n\r\n網路資訊:\r\n 工作站名稱: MPDC19-02\r\n 來源網路位址: 192.168.10.22\r\n 來源連接埠:  58994\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  Advapi  \r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，…(截斷)",
            "[2026-04-28 14:08:43] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813346134461360787\nMPINFO\\MP0332: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  NT AUTHORITY\\SYSTEM\r\n 帳戶名稱:  MPDC19-02$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x3E7\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  MP0332\r\n 帳戶網域:  MPINFO\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x2fc\r\n 呼叫者處理程序名稱: C:\\Windows\\System32\\lsass.exe\r\n\r\n網路資訊:\r\n 工作站名稱: MPDC19-02\r\n 來源網路位址: 192.168.10.22\r\n 來源連接埠:  59008\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  Advapi  \r\n 驗證封裝: MICROSOFT_AUTHENTICATION_PACKAGE_V1_0\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，…(截斷)"
        ],
        iocList: []
    },
    {
        id: 76,
        title: "MP0424登入失敗後成功（DSServADE.exe）",
        starRank: 2,
        date: "2026-04-28",
        dateEnd: "2026-04-28",
        detectionCount: 4,
        affectedSummary: "MP0424帳號",
        affected: "【異常發現】192.168.10.8（MP2FA-01）以MPINFO.COM.TW\\MP0424帳號先後在MPDC19-01出現登入失敗（0xC000006D）後成功登入，成功登入由DSServADE.exe程序發起，使用埠54771/54772。\n【風險分析】失敗後成功的登入模式可能表示密碼猜測成功，或是合法服務重試機制。DSServADE.exe需確認是否為已知合法應用程式，若非授權程式則需立即調查。",
        currentStatus: "未處理",
        assignee: null,
        history: [],
        desc: "MP2FA-01(192.168.10.8)以MP0424帳號登入MPDC19-01先失敗後由DSServADE.exe成功登入，需確認DSServADE.exe的合法性及此認證行為是否為授權操作。",
        mitre: [
            {
                id: "T1110.001",
                name: "",
                url: "https://attack.mitre.org/techniques/T1110/001/"
            },
            {
                id: "T1078",
                name: "",
                url: "https://attack.mitre.org/techniques/T1078/"
            }
        ],
        suggests: [
            {
                urgency: "最推薦",
                text: "確認DSServADE.exe的廠商與用途，確認其合法性",
                refs: []
            },
            {
                urgency: "最推薦",
                text: "審查MP0424帳號近期的所有登入記錄",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "確認192.168.10.8（MP2FA-01）上安裝的軟體清單",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "若DSServADE.exe非合法程式，立即進行端點鑑識",
                refs: []
            },
            {
                urgency: "可選",
                text: "強制要求MP0424帳號啟用MFA",
                refs: []
            }
        ],
        logs: [
            "[2026-04-28 11:19:16] host=mp2fa-01 program=Microsoft_Windows_security_auditing. id=813346134463100092\nMPINFO.COM.TW\\MP0424: Security Microsoft Windows security auditing.: [Success Audit] 使用明確宣告的認證嘗試登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x9769\r\n 登入 GUID:  {00000000-0000-0000-0000-000000000000}\r\n\r\n使用其認證的帳戶:\r\n 帳戶名稱:  MP0424\r\n 帳戶網域:  MPINFO.COM.TW\r\n 登入 GUID:  {00000000-0000-0000-0000-000000000000}\r\n\r\n目標伺服器:\r\n 目標伺服器名稱: MPDC19-01.mpinfo.com.tw\r\n 其他資訊: MPDC19-01.mpinfo.com.tw\r\n\r\n處理程序資訊:\r\n 處理程序識別碼:  0xbfc\r\n 處理程序名稱:  C:\\Program Files\\One Identity\\Defender\\Security Server\\DSServADE.exe\r\n\r\n網路資訊:\r\n 網路位址: -\r\n 連接埠:   -\r\n\r\n當處理程序嘗試以帳戶的明確宣告認證登入那個帳戶時，就會產生這個事件。這通常發生在批次類型的設定，例如排程工作，或是當使用…(截斷)",
            "[2026-04-28 11:19:17] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461331386\nMPINFO.COM.TW\\MP0424: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  MP0424\r\n 帳戶網域:  MPINFO.COM.TW\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: MP2FA-01\r\n 來源網路位址: 192.168.10.8\r\n 來源連接埠:  54771\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位顯示要求登入的本機系統上的帳戶。這通常是發生在服務 (例如伺服器服務) 或是本機處理程序…(截斷)",
            "[2026-04-28 11:19:21] host=mpdc19-01 program=Microsoft_Windows_security_auditing. id=813346134461331397\nMPINFO.COM.TW\\MP0424: Security Microsoft Windows security auditing.: [Failure Audit] 帳戶無法登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x0\r\n\r\n登入類型:   3\r\n\r\n登入失敗的帳戶:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  MP0424\r\n 帳戶網域:  MPINFO.COM.TW\r\n\r\n失敗資訊:\r\n 失敗原因:  不明的使用者名稱或錯誤密碼。\r\n 狀態:   0xC000006D\r\n 子狀態:  0xC000006A\r\n\r\n處理程序資訊:\r\n 呼叫者處理程序識別碼: 0x0\r\n 呼叫者處理程序名稱: -\r\n\r\n網路資訊:\r\n 工作站名稱: MP2FA-01\r\n 來源網路位址: 192.168.10.8\r\n 來源連接埠:  54772\r\n\r\n詳細驗證資訊:\r\n 登入處理程序:  NtLmSsp \r\n 驗證封裝: NTLM\r\n 轉送的服務: -\r\n 封裝名稱 (僅限 NTLM): -\r\n 金鑰長度:  0\r\n\r\n當登入要求失敗的時候，就會產生這個事件。這個事件在嘗試存取的電腦上產生。\r\n\r\n主旨欄位顯示要求登入的本機系統上的帳戶。這通常是發生在服務 (例如伺服器服務) 或是本機處理程序…(截斷)",
            "[2026-04-28 11:19:21] host=mp2fa-01 program=Microsoft_Windows_security_auditing. id=813346134463100525\nMPINFO.COM.TW\\MP0424: Security Microsoft Windows security auditing.: [Success Audit] 使用明確宣告的認證嘗試登入。\r\n\r\n主旨:\r\n 安全性識別碼:  \\NULL SID\r\n 帳戶名稱:  -\r\n 帳戶網域:  -\r\n 登入識別碼:  0x9769\r\n 登入 GUID:  {00000000-0000-0000-0000-000000000000}\r\n\r\n使用其認證的帳戶:\r\n 帳戶名稱:  MP0424\r\n 帳戶網域:  MPINFO.COM.TW\r\n 登入 GUID:  {00000000-0000-0000-0000-000000000000}\r\n\r\n目標伺服器:\r\n 目標伺服器名稱: MPDC19-01.mpinfo.com.tw\r\n 其他資訊: MPDC19-01.mpinfo.com.tw\r\n\r\n處理程序資訊:\r\n 處理程序識別碼:  0xbfc\r\n 處理程序名稱:  C:\\Program Files\\One Identity\\Defender\\Security Server\\DSServADE.exe\r\n\r\n網路資訊:\r\n 網路位址: -\r\n 連接埠:   -\r\n\r\n當處理程序嘗試以帳戶的明確宣告認證登入那個帳戶時，就會產生這個事件。這通常發生在批次類型的設定，例如排程工作，或是當使用…(截斷)"
        ],
        iocList: [
            "192.168.10.8"
        ]
    },
    {
        id: 77,
        title: "Azure AD Sync帳號頻繁驗證（需確認正常性）",
        starRank: 2,
        date: "2026-04-28",
        dateEnd: "2026-04-28",
        detectionCount: 22,
        affectedSummary: "MSOL_2cd93d9077be",
        affected: "【異常發現】MPINFO.COM.TW\\MSOL_2cd93d9077be帳號在4/28頻繁對MPDC19-02進行LDAP驗證（Event 4648），共22次，來源為192.168.10.20。\n【風險分析】MSOL_前綴帳號為Azure AD Connect服務帳號，日常同步屬正常行為。但若認證資訊遭洩露，攻擊者可利用其AD同步權限進行大規模帳號操控（DCSync攻擊）。",
        currentStatus: "未處理",
        assignee: null,
        history: [],
        desc: "MSOL_2cd93d9077be帳號頻繁對MPDC19-02發起LDAP驗證共22次，屬Azure AD與本地AD同步的正常行為，但若帳號認證資訊洩露，攻擊者可利用其AD同步權限發動DCSync攻擊。",
        mitre: [
            {
                id: "T1098",
                name: "",
                url: "https://attack.mitre.org/techniques/T1098/"
            }
        ],
        suggests: [
            {
                urgency: "最推薦",
                text: "確認Azure AD Connect同步頻率設定是否正常",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "定期稽核MSOL帳號的權限範圍",
                refs: []
            },
            {
                urgency: "次推薦",
                text: "監控MSOL帳號是否有異常的AD查詢或修改操作",
                refs: []
            },
            {
                urgency: "可選",
                text: "確保Azure AD Connect服務帳號密碼定期輪換",
                refs: []
            }
        ],
        logs: [
            "[2026-04-02 11:20:18] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813317547159015688\nMPINFO.COM.TW\\MSOL_2cd93d9077be: Security Microsoft Windows security auditing.: [Success Audit] 使用明確宣告的認證嘗試登入。\r\n\r\n主旨:\r\n 安全性識別碼:  MPINFO\\ADSyncMSA2cd93$\r\n 帳戶名稱:  ADSyncMSA2cd93$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x1FCCA\r\n 登入 GUID:  {6917bd66-fe87-60cd-8f59-df6509ed83f7}\r\n\r\n使用其認證的帳戶:\r\n 帳戶名稱:  MSOL_2cd93d9077be\r\n 帳戶網域:  MPINFO.COM.TW\r\n 登入 GUID:  {eb19f24f-34af-67f8-bee5-0dced5e37ae1}\r\n\r\n目標伺服器:\r\n 目標伺服器名稱: MPDC19-02.mpinfo.com.tw\r\n 其他資訊: ldap/MPDC19-02.mpinfo.com.tw/mpinfo.com.tw\r\n\r\n處理程序資訊:\r\n 處理程序識別碼:  0x12ec\r\n 處理程序名稱:  C:\\Program Files\\Microsoft Azure AD Sync\\Bin\\miiserver.exe\r\n\r\n網路資訊:\r\n 網路位址: -\r\n 連接埠:   …(截斷)",
            "[2026-04-02 11:20:18] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813317547159015691\nMPINFO.COM.TW\\MSOL_2cd93d9077be: Security Microsoft Windows security auditing.: [Success Audit] 使用明確宣告的認證嘗試登入。\r\n\r\n主旨:\r\n 安全性識別碼:  MPINFO\\ADSyncMSA2cd93$\r\n 帳戶名稱:  ADSyncMSA2cd93$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x1FCCA\r\n 登入 GUID:  {6917bd66-fe87-60cd-8f59-df6509ed83f7}\r\n\r\n使用其認證的帳戶:\r\n 帳戶名稱:  MSOL_2cd93d9077be\r\n 帳戶網域:  MPINFO.COM.TW\r\n 登入 GUID:  {eb19f24f-34af-67f8-bee5-0dced5e37ae1}\r\n\r\n目標伺服器:\r\n 目標伺服器名稱: MPDC19-02.mpinfo.com.tw\r\n 其他資訊: ldap/MPDC19-02.mpinfo.com.tw/mpinfo.com.tw\r\n\r\n處理程序資訊:\r\n 處理程序識別碼:  0x12ec\r\n 處理程序名稱:  C:\\Program Files\\Microsoft Azure AD Sync\\Bin\\miiserver.exe\r\n\r\n網路資訊:\r\n 網路位址: -\r\n 連接埠:   …(截斷)",
            "[2026-04-02 11:20:18] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813317547159015694\nMPINFO.COM.TW\\MSOL_2cd93d9077be: Security Microsoft Windows security auditing.: [Success Audit] 使用明確宣告的認證嘗試登入。\r\n\r\n主旨:\r\n 安全性識別碼:  MPINFO\\ADSyncMSA2cd93$\r\n 帳戶名稱:  ADSyncMSA2cd93$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x1FCCA\r\n 登入 GUID:  {6917bd66-fe87-60cd-8f59-df6509ed83f7}\r\n\r\n使用其認證的帳戶:\r\n 帳戶名稱:  MSOL_2cd93d9077be\r\n 帳戶網域:  MPINFO.COM.TW\r\n 登入 GUID:  {eb19f24f-34af-67f8-bee5-0dced5e37ae1}\r\n\r\n目標伺服器:\r\n 目標伺服器名稱: MPDC19-02.mpinfo.com.tw\r\n 其他資訊: ldap/MPDC19-02.mpinfo.com.tw/mpinfo.com.tw\r\n\r\n處理程序資訊:\r\n 處理程序識別碼:  0x12ec\r\n 處理程序名稱:  C:\\Program Files\\Microsoft Azure AD Sync\\Bin\\miiserver.exe\r\n\r\n網路資訊:\r\n 網路位址: -\r\n 連接埠:   …(截斷)",
            "[2026-04-02 11:20:18] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813317547159015697\nMPINFO.COM.TW\\MSOL_2cd93d9077be: Security Microsoft Windows security auditing.: [Success Audit] 使用明確宣告的認證嘗試登入。\r\n\r\n主旨:\r\n 安全性識別碼:  MPINFO\\ADSyncMSA2cd93$\r\n 帳戶名稱:  ADSyncMSA2cd93$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x1FCCA\r\n 登入 GUID:  {6917bd66-fe87-60cd-8f59-df6509ed83f7}\r\n\r\n使用其認證的帳戶:\r\n 帳戶名稱:  MSOL_2cd93d9077be\r\n 帳戶網域:  MPINFO.COM.TW\r\n 登入 GUID:  {eb19f24f-34af-67f8-bee5-0dced5e37ae1}\r\n\r\n目標伺服器:\r\n 目標伺服器名稱: 4cdc8566-5cf8-45bc-b608-bb07d53ca20c\r\n 其他資訊: E3514235-4B06-11D1-AB04-00C04FC2DCD2/4cdc8566-5cf8-45bc-b608-bb07d53ca20c/mpinfo.com.tw\r\n\r\n處理程序資訊:\r\n 處理程序識別碼:  0x12ec\r\n 處理程序名稱:  C:\\Program Files\\Microsoft Az…(截斷)",
            "[2026-04-28 13:28:59] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813346134461353449\nMPINFO.COM.TW\\MSOL_2cd93d9077be: Security Microsoft Windows security auditing.: [Success Audit] 使用明確宣告的認證嘗試登入。\r\n\r\n主旨:\r\n 安全性識別碼:  MPINFO\\ADSyncMSA2cd93$\r\n 帳戶名稱:  ADSyncMSA2cd93$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x20EEB\r\n 登入 GUID:  {1301a2c3-b78f-4359-a59e-877d390be112}\r\n\r\n使用其認證的帳戶:\r\n 帳戶名稱:  MSOL_2cd93d9077be\r\n 帳戶網域:  MPINFO.COM.TW\r\n 登入 GUID:  {00000000-0000-0000-0000-000000000000}\r\n\r\n目標伺服器:\r\n 目標伺服器名稱: MPDC19-02.mpinfo.com.tw\r\n 其他資訊: ldap/MPDC19-02.mpinfo.com.tw/mpinfo.com.tw\r\n\r\n處理程序資訊:\r\n 處理程序識別碼:  0x12c4\r\n 處理程序名稱:  C:\\Program Files\\Microsoft Azure AD Sync\\Bin\\miiserver.exe\r\n\r\n網路資訊:\r\n 網路位址: -\r\n 連接埠:   …(截斷)",
            "[2026-04-28 13:28:59] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813346134461353451\nMPINFO.COM.TW\\MSOL_2cd93d9077be: Security Microsoft Windows security auditing.: [Success Audit] 使用明確宣告的認證嘗試登入。\r\n\r\n主旨:\r\n 安全性識別碼:  MPINFO\\ADSyncMSA2cd93$\r\n 帳戶名稱:  ADSyncMSA2cd93$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x20EEB\r\n 登入 GUID:  {1301a2c3-b78f-4359-a59e-877d390be112}\r\n\r\n使用其認證的帳戶:\r\n 帳戶名稱:  MSOL_2cd93d9077be\r\n 帳戶網域:  MPINFO.COM.TW\r\n 登入 GUID:  {00000000-0000-0000-0000-000000000000}\r\n\r\n目標伺服器:\r\n 目標伺服器名稱: MPDC19-02.mpinfo.com.tw\r\n 其他資訊: ldap/MPDC19-02.mpinfo.com.tw/mpinfo.com.tw\r\n\r\n處理程序資訊:\r\n 處理程序識別碼:  0x12c4\r\n 處理程序名稱:  C:\\Program Files\\Microsoft Azure AD Sync\\Bin\\miiserver.exe\r\n\r\n網路資訊:\r\n 網路位址: -\r\n 連接埠:   …(截斷)",
            "[2026-04-28 13:28:59] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813346134461353453\nMPINFO.COM.TW\\MSOL_2cd93d9077be: Security Microsoft Windows security auditing.: [Success Audit] 使用明確宣告的認證嘗試登入。\r\n\r\n主旨:\r\n 安全性識別碼:  MPINFO\\ADSyncMSA2cd93$\r\n 帳戶名稱:  ADSyncMSA2cd93$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x20EEB\r\n 登入 GUID:  {1301a2c3-b78f-4359-a59e-877d390be112}\r\n\r\n使用其認證的帳戶:\r\n 帳戶名稱:  MSOL_2cd93d9077be\r\n 帳戶網域:  MPINFO.COM.TW\r\n 登入 GUID:  {00000000-0000-0000-0000-000000000000}\r\n\r\n目標伺服器:\r\n 目標伺服器名稱: MPDC19-02.mpinfo.com.tw\r\n 其他資訊: ldap/MPDC19-02.mpinfo.com.tw/mpinfo.com.tw\r\n\r\n處理程序資訊:\r\n 處理程序識別碼:  0x12c4\r\n 處理程序名稱:  C:\\Program Files\\Microsoft Azure AD Sync\\Bin\\miiserver.exe\r\n\r\n網路資訊:\r\n 網路位址: -\r\n 連接埠:   …(截斷)",
            "[2026-04-28 13:28:59] host=mpdc19-02 program=Microsoft_Windows_security_auditing. id=813346134461353455\nMPINFO.COM.TW\\MSOL_2cd93d9077be: Security Microsoft Windows security auditing.: [Success Audit] 使用明確宣告的認證嘗試登入。\r\n\r\n主旨:\r\n 安全性識別碼:  MPINFO\\ADSyncMSA2cd93$\r\n 帳戶名稱:  ADSyncMSA2cd93$\r\n 帳戶網域:  MPINFO\r\n 登入識別碼:  0x20EEB\r\n 登入 GUID:  {1301a2c3-b78f-4359-a59e-877d390be112}\r\n\r\n使用其認證的帳戶:\r\n 帳戶名稱:  MSOL_2cd93d9077be\r\n 帳戶網域:  MPINFO.COM.TW\r\n 登入 GUID:  {00000000-0000-0000-0000-000000000000}\r\n\r\n目標伺服器:\r\n 目標伺服器名稱: MPDC19-02.mpinfo.com.tw\r\n 其他資訊: ldap/MPDC19-02.mpinfo.com.tw/mpinfo.com.tw\r\n\r\n處理程序資訊:\r\n 處理程序識別碼:  0x12c4\r\n 處理程序名稱:  C:\\Program Files\\Microsoft Azure AD Sync\\Bin\\miiserver.exe\r\n\r\n網路資訊:\r\n 網路位址: -\r\n 連接埠:   …(截斷)"
        ],
        iocList: [
            "192.168.10.20"
        ]
    }
];

// ─── Chat 知識庫（Mock AI 回應） ───
const mockKnowledge = {
    1: {
        摘要: `全日 Domain Controller 稽核政策被異常修改 30,972 次，極可能為攻擊者遮蔽後滲透行動的手法。此為最高優先處置項目。`,
        發現: `EventID 4719 共 30,972 筆，集中於 mpdc19-01、mpdc19-02、mpdc19-hq，遠超正常基線（每日 < 100 筆）`,
        說明: `EventID 4719 記錄系統稽核政策的變更。攻擊者取得 DC 存取後常關閉 Process Tracking、Account Logon 等稽核類別，讓後續活動（橫向移動、憑證竊取）不留紀錄。此為後滲透標準手法（Living off the Land）。`,
        修復: `【緊急 0~2 小時】\n1. 備份現有所有 Security Event Log\n2. 透過 GPO 強制重新套用稽核政策\n3. 確認哪個帳號觸發了 4719，追蹤其近期所有登入行為\n\n【短期 2~24 小時】\n4. 部署 SIEM 告警：任何非 GPO 觸發的 4719 立即通知\n5. 稽核 Domain Admin 群組成員，確認無未知帳號`,
        步驟前綴: {}
    },
    2: {
        摘要: `2/23 確認遭 C2 感染的 192.168.10.20 在 3/16 仍持續活躍，顯示當初清除行動可能不完整，威脅持續存在。`,
        發現: `192.168.10.20 全日 Windows 活動 5,572 筆（來源IP統計 Top 3）；2/23 已確認為 DNS C2 Tunneling 受害主機`,
        說明: `APT 等級攻擊的惡意程式（如 dnscat2）具備高度持久化能力，可躲避一般防毒掃描。若 2/23 的清除僅依賴防毒而未進行完整 Reimaging，殘留的後門可能持續運作。`,
        修復: `【立即】重新隔離 192.168.10.20，切斷其對外及對 DC 的所有連線\n【短期】完整記憶體鑑識 → 若確認感染，Reimaging → 從已知乾淨的備份（2/23 之前）重建`,
        步驟前綴: {}
    },
    3: {
        摘要: `內部主機 172.16.1.112 對 Domain Controllers 發起 421 次登入失敗，佔全日62%，疑似受感染主機進行橫向移動密碼噴灑攻擊。`,
        發現: `172.16.1.112 登入失敗 421 次 / 172.17.1.57 失敗 127 次；無帳號鎖定記錄（低速噴灑策略）`,
        說明: `Password Spraying 以低速度嘗試少數常見密碼，可避免觸發帳號鎖定機制。攻擊者常在取得初始立足點後，用受感染的內部主機進行噴灑以橫向移動。`,
        修復: `1. 識別並隔離 172.16.1.112\n2. 在 DC 上查詢是否有對應的成功登入（EventID 4624）\n3. 強制所有帳號重設密碼（尤其是 172.16.x 段服務帳號）\n4. 啟用 MFA 於特權帳號`,
        步驟前綴: {}
    },
    4: {
        摘要: `Azure AD Sync 服務帳號全日觸發 4,837 次明文登入嘗試，頻率約每 7 秒一次，可能代表服務遭篡改或憑證被盜用。`,
        發現: `4648 共 4,837 筆，帳號 ADSyncMSA2cd93$（Azure AD Sync MSA）持續觸發，集中於 mpdc19-01/02`,
        說明: `EventID 4648 記錄程式使用特定憑證（非當前使用者）進行驗證的行為。正常 Azure AD Sync 每隔 30 分鐘執行一次，不應產生如此高頻的 4648。`,
        修復: `1. 重設 ADSyncMSA2cd93$ 密碼\n2. 重新安裝/重設 Azure AD Connect 服務配置\n3. 檢查 Azure AD 稽核日誌中是否有異常帳號同步\n4. 啟用 Azure AD Identity Protection 異常登入告警`,
        步驟前綴: {}
    },
    5: {
        摘要: `13:30~16:30 防火牆 deny 持續高於基線 50-60%，累計超額 6 萬筆，可能有外部攻擊活動或內部主機異常外連。`,
        發現: `13:30 deny=39,703（+61%）、14:00=33,590、14:30=37,352（+51%）；deny_dst Top1：211.72.78.169（336,516 筆）`,
        說明: `防火牆 deny 量突然上升並持續數小時，常見於：(1) 外部掃描/DDoS 波動；(2) 內部感染主機嘗試 C2 外連；(3) 不對稱路由造成異常流量。`,
        修復: `1. 確認 211.72.78.169 IP 歸屬（whois 查詢）\n2. 隔離調查 172.18.1.89\n3. 建立基線告警機制\n4. 審查 13:30 前後的防火牆規則變更記錄`,
        步驟前綴: {}
    },
    6: {
        摘要: `外部 IP 6.239.234.0 使用 meraki_8021x_test 帳號嘗試無線認證，RADIUS 伺服器已拒絕，但顯示 RADIUS 服務可能面向外部，需立即確認並封鎖。`,
        發現: `EventID 6273（RADIUS 拒絕）：acc=meraki_8021x_test, src=6.239.234.0（外部 IP），理由代碼 8：帳號不存在`,
        說明: `RADIUS 服務通常僅應接受來自內部 NAS 設備的請求。若 RADIUS 直接暴露於外部網路，攻擊者可嘗試暴力破解無線憑證並取得網路存取。`,
        修復: `1. 檢查防火牆規則，封鎖外部對 UDP 1812/1813 的存取\n2. 停用並調查 meraki_8021x_test 帳號\n3. 檢視 RADIUS ACL，僅允許已知 NAS IP`,
        步驟前綴: {}
    },
    7: {
        摘要: `正常業務流量，主要為 HTTPS/DNS，無明顯異常。但需確認 2/23 的防火牆策略修改是否已落實。`,
        發現: `Allow 3,665,670 筆 / Deny 512,325 筆 / HTTPS 占 37% / DNS 占 4%`,
        說明: `全日流量組成正常，無單一異常 IP 或服務占比過高。此為環境基線參考數據。`,
        修復: `確認 2/23 建議的防火牆規則收緊是否已執行。`,
        步驟前綴: {}
    }
};

// ─── 歷史相似事件 ───
const similarCasesData = {
    1: [
        { id:'SC001', date:'2025-11-15', title:'DNS Tunneling 感染事件', similarity:92,
          summary:'內部 DNS 伺服器 192.168.10.15 向中國 IP 持續發出異常 DNS 查詢（Fast-flux 特徵），確認為 dnscat2 工具感染，C2 Beaconing 行為。',
          outcome:'已完成', resolvedAt:'2025-11-15 14:32', resolvedBy:'Rex Shen', resolution:'隔離主機、重新安裝 OS，更新防火牆 GeoIP 規則封鎖中國及荷蘭 IP，加強 DNS 解析行為監控。' },
        { id:'SC002', date:'2025-08-03', title:'郵件伺服器 C2 Beaconing 偵測', similarity:74,
          summary:'郵件伺服器定期向外部 IP 發出心跳包，傳輸長度異常（87-115 B），確認為惡意後門程式。',
          outcome:'已完成', resolvedAt:'2025-08-03 09:15', resolvedBy:'Dama Wang', resolution:'移除惡意後門程式、強化出站流量告警，部署 NDR 側錄規則。' }
    ],
    2: [
        { id:'SC003', date:'2025-06-20', title:'SVR_to_WAN 防火牆策略過寬', similarity:88,
          summary:'多條防火牆規則允許伺服器段任意對外連線，經稽核發現有 5 台主機利用此策略進行未授權的外部通訊。',
          outcome:'已完成', resolvedAt:'2025-06-20 16:50', resolvedBy:'Frank Liu', resolution:'建立目的地白名單、啟用 GeoIP 過濾，策略調整後減少 73% 不必要流量。' }
    ],
    3: [
        { id:'SC004', date:'2025-09-12', title:'VPN 用戶端 DNS Payload 注入', similarity:91,
          summary:'VPN 用戶端收到超大型 DNS 回應（3.1 KB），分析確認為攻擊者使用 iodine 工具進行橫向移動嘗試。',
          outcome:'已完成', resolvedAt:'2025-09-12 11:20', resolvedBy:'Rex Shen', resolution:'PCAP 分析確認為惡意 payload、強制 DNS 快取清理、端點掃描確認未進一步感染。' },
        { id:'SC005', date:'2025-12-01', title:'VPN 異常封包監測（誤報）', similarity:62,
          summary:'VPN 段多台設備收到異常大型封包，後確認為 EDNS0 合法 TXT 記錄查詢。',
          outcome:'擱置', resolvedAt:'2025-12-01 08:45', resolvedBy:'Dama Wang', resolution:'確認為誤報，建立流量閾值 > 2 KB 才觸發高優先告警，降低 SOC 分析負荷。' }
    ],
    4: [
        { id:'SC006', date:'2026-01-08', title:'行政帳號 Low-and-Slow 暴力破解', similarity:95,
          summary:'Administrator 帳號遭受來自東歐多個 IP 的低速暴力破解（每分鐘 < 3 次嘗試，持續 48 小時）以規避鎖定偵測。',
          outcome:'已完成', resolvedAt:'2026-01-08 22:10', resolvedBy:'Rex Shen', resolution:'啟用 MFA、Fortinet IPS 封鎖來源 IP 段、稽核近 30 天成功登入紀錄確認無入侵。' }
    ],
    5: [
        { id:'SC007', date:'2025-09-12', title:'VPN DNS 1.1 KB 異常回應（同期）', similarity:83,
          summary:'VPN 用戶端 172.18.1.55 收到 1.1 KB DNS 回應，與事件 3 同時段發生，後確認為合法 TXT 記錄。',
          outcome:'擱置', resolvedAt:'2025-09-12 17:30', resolvedBy:'Frank Liu', resolution:'觀察後確認為誤報，列入持續觀察清單，搭配 PCAP 監控。' }
    ],
    6: [],
    7: []
};

// ─── 公司資料（每筆 = 一個資料名稱 + 一段內容，內容用換行分隔多條規則） ───
let allCompanyData = [
    {
        id: 1,
        name: '公司網段',
        content: [
            '公司內網主要使用 192.168.0.0/16 網段；VPN 用戶端使用 172.18.0.0/16，亦屬授權內網。任何來自非上述網段的請求應視為外部行為。',
            'DMZ 對外服務固定為 192.168.10.30 (Web)、192.168.10.40 (Mail)，其餘對外連線需另行確認。'
        ].join('\n'),
        partners: ['資安專家']
    },
    {
        id: 2,
        name: '重要設備名單',
        content: [
            'DC-SVR-01：IP 192.168.10.20，Windows Server 2022，Domain Controller（主 DNS），負責人 Dama Wang，位置 IDC 機房 B。',
            'MPIDCFW：IP 192.168.1.1，FortiOS 7.4，主邊界防火牆，負責人 Rex Shen，位置 IDC 機房 A。',
            'WEB-SVR-01：IP 192.168.10.30，Ubuntu 22.04 LTS，DMZ Web 應用伺服器，負責人 Frank Liu，位置 IDC 機房 B。'
        ].join('\n'),
        partners: ['資安專家']
    },
    {
        id: 3,
        name: '白名單',
        content: [
            'Windows 4625 登入失敗事件，若來源 IP 屬於內網（192.168.x.x）且帳號為服務帳號（svc_*），視為已知正常，不需報警。',
            '每月 1 號 02:00–04:00 的 svc_backup 大量 4624/4634 事件為定期備份排程。',
            '來源 IP 192.168.1.100 的全網掃描為 IT 弱掃主機定期作業。'
        ].join('\n'),
        partners: ['資安專家']
    },
    {
        id: 4,
        name: '公司處置方法',
        content: [
            'FortiGate deny 內部廣播位址（dstport 137-139, 445）為網路廣播正常行為，不需報警。',
            'FortiGate subtype=virus 但 action=blocked 表示已被防毒攔截，可降為 INFO 等級。',
            'FortiGate level=notice 的 traffic log 為一般通過紀錄，量大時不視為事件。'
        ].join('\n'),
        partners: ['資安專家']
    }
];
