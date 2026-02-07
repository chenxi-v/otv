import { useState } from 'react'
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Card, CardBody, Divider } from '@heroui/react'
import { useDoubanApiStore, type DoubanApiConfig } from '@/store/doubanApiStore'
import { Plus, Trash2, Info } from 'lucide-react'

export default function DoubanApiSettings() {
  const {
    doubanApis,
    selectedDataApiId,
    selectedImageApiId,
    addDoubanApi,
    removeDoubanApi,
    setSelectedDataApiId,
    setSelectedImageApiId,
    resetDoubanApis,
  } = useDoubanApiStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newApi, setNewApi] = useState({
    name: '',
    dataApiUrl: '',
    imageApiUrl: '',
  })

  const handleAddApi = () => {
    if (!newApi.name || !newApi.dataApiUrl || !newApi.imageApiUrl) {
      return
    }

    const api: DoubanApiConfig = {
      id: `custom-${Date.now()}`,
      name: newApi.name,
      dataApiUrl: newApi.dataApiUrl,
      imageApiUrl: newApi.imageApiUrl,
      isEnabled: true,
    }

    addDoubanApi(api)
    setNewApi({ name: '', dataApiUrl: '', imageApiUrl: '' })
    setIsAddModalOpen(false)
  }

  const handleRemoveApi = (id: string) => {
    if (doubanApis.length <= 1) {
      return
    }
    removeDoubanApi(id)
  }

  const getApiDescription = (api: DoubanApiConfig) => {
    switch (api.id) {
      case 'default':
        return '使用默认豆瓣API，通过本地代理获取数据'
      case 'ali-cdn':
        return '使用阿里CDN加速访问豆瓣API'
      case 'tencent-cdn':
        return '使用腾讯CDN加速访问豆瓣API'
      case 'baidu':
        return '使用百度图片代理服务'
      default:
        return '自定义API配置'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">豆瓣API配置</h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          配置豆瓣数据API和图片API，用于获取豆瓣电影数据。
        </p>
      </div>

      <div className="space-y-4">
        <Card className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <CardBody className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                数据API
              </label>
              <Select
                label="选择数据API"
                placeholder="选择一个数据API"
                selectedKeys={selectedDataApiId ? [selectedDataApiId] : []}
                onSelectionChange={keys => {
                  const key = Array.from(keys)[0] as string
                  setSelectedDataApiId(key)
                }}
                className="w-full"
                description={getApiDescription(doubanApis.find(a => a.id === selectedDataApiId) || doubanApis[0])}
              >
                {doubanApis.map(api => (
                  <SelectItem key={api.id}>
                    {api.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Divider />

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                图片API
              </label>
              <Select
                label="选择图片API"
                placeholder="选择一个图片API"
                selectedKeys={selectedImageApiId ? [selectedImageApiId] : []}
                onSelectionChange={keys => {
                  const key = Array.from(keys)[0] as string
                  setSelectedImageApiId(key)
                }}
                className="w-full"
                description={getApiDescription(doubanApis.find(a => a.id === selectedImageApiId) || doubanApis[0])}
              >
                {doubanApis.map(api => (
                  <SelectItem key={api.id}>
                    {api.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Divider />

            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">已配置的API</h4>
              <div className="space-y-3">
                {doubanApis.map(api => (
                  <div
                    key={api.id}
                    className="flex items-start justify-between rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {api.name}
                        </div>
                        {selectedDataApiId === api.id && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            数据
                          </span>
                        )}
                        {selectedImageApiId === api.id && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                            图片
                          </span>
                        )}
                      </div>
                      <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                        数据: {api.dataApiUrl}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        图片: {api.imageApiUrl}
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        {getApiDescription(api)}
                      </p>
                    </div>
                    {api.id !== 'default' && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleRemoveApi(api.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Divider />

            <div className="flex flex-wrap gap-2">
              <Button
                color="primary"
                startContent={<Plus className="h-4 w-4" />}
                onPress={() => setIsAddModalOpen(true)}
              >
                添加自定义API
              </Button>
              <Button
                variant="bordered"
                onPress={resetDoubanApis}
              >
                重置为默认
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Info className="h-4 w-4" />
                <span>选择不同的API可以解决访问限制问题</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <ModalContent>
          <ModalHeader>添加自定义API</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="API名称"
                placeholder="例如：我的API"
                value={newApi.name}
                onValueChange={value => setNewApi({ ...newApi, name: value })}
              />
              <Input
                label="数据API地址"
                placeholder="例如：https://api.example.com/douban"
                value={newApi.dataApiUrl}
                onValueChange={value => setNewApi({ ...newApi, dataApiUrl: value })}
              />
              <Input
                label="图片API地址"
                placeholder="例如：https://api.example.com/douban-image"
                value={newApi.imageApiUrl}
                onValueChange={value => setNewApi({ ...newApi, imageApiUrl: value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsAddModalOpen(false)}>
              取消
            </Button>
            <Button color="primary" onPress={handleAddApi}>
              添加
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}