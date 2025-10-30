import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { aiService } from '@/services/aiService'

// 可用性检查组件
function AvailabilityCheck() {
    const [availability, setAvailability] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleCheck = async () => {
        setLoading(true)
        const result = await aiService.getBuiltInAvailabilityStatus()
        setAvailability(result)
        setLoading(false)
    }

    const goodStates = ["readily", "after-download", "downloadable", "available", "downloading"]

    return (
        <div className="p-3 bg-white/5 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">🔍 检查 Gemini Nano 可用性</h3>
            <button
                onClick={handleCheck}
                disabled={loading}
                className="w-full py-2 px-4 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "检查中..." : "检查可用性"}
            </button>
            <div className="mt-3 text-sm">
                {availability === null ? (
                    <p className="text-white/60">点击按钮检查 Gemini Nano 可用性</p>
                ) : goodStates.includes(availability) ? (
                    <p className="text-green-300">✅ 可用 ({availability})</p>
                ) : (
                    <p className="text-red-300">❌ 不可用 ({availability})</p>
                )}
            </div>
        </div>
    )
}

interface BuiltInAIConfigurationProps {
    builtInAvailable: 'checking' | 'ready' | 'unavailable'
}

export default function BuiltInAIConfiguration({ builtInAvailable }: BuiltInAIConfigurationProps) {
    return (
        <>
            {/* Status */}
            <div className={`p-4 rounded-lg ${builtInAvailable === 'ready' ? 'bg-green-500/20' :
                builtInAvailable === 'unavailable' ? 'bg-red-500/20' :
                    'bg-blue-500/20'
                }`}>
                <div className="flex items-start gap-2">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        {builtInAvailable === 'checking' && '正在检查 API 可用性...'}
                        {builtInAvailable === 'ready' && '✅ Chrome 内置 AI 已就绪！'}
                        {builtInAvailable === 'unavailable' && (
                            <>
                                <div className="font-semibold mb-1">❌ Chrome 内置 AI 不可用</div>
                                <div className="text-xs opacity-90">
                                    请确保：
                                    <br />• 使用 Chrome 127+ 版本
                                    <br />• 启用实验性功能：chrome://flags/#optimization-guide-on-device-model
                                    <br />• 启用：chrome://flags/#prompt-api-for-gemini-nano
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {builtInAvailable === 'ready' && (
                <>
                    {/* Availability Check Component */}
                    <AvailabilityCheck />

                    {/* Info */}
                    <div className="p-3 bg-white/5 rounded-lg text-xs opacity-80">
                        <div className="font-semibold mb-1">关于 Chrome 内置 AI：</div>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>使用 Gemini Nano 模型，完全在本地运行</li>
                            <li>无需网络连接，保护隐私</li>
                            <li>支持自定义系统提示词</li>
                            <li>适合快速、轻量级的 AI 交互</li>
                        </ul>
                        <div className="mt-2 pt-2 border-t border-white/10">
                            <a
                                href="https://developer.chrome.com/docs/ai/built-in?hl=zh-cn"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-300 hover:text-blue-200 underline"
                            >
                                查看完整文档 →
                            </a>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

// 导出 aiService 方法供其他组件使用
export { aiService }
