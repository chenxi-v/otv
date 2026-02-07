'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MultiLevelOption {
  label: string;
  value: string;
}

interface MultiLevelCategory {
  key: string;
  label: string;
  options: MultiLevelOption[];
}

interface MultiLevelSelectorProps {
  onChange: (values: Record<string, string>) => void;
  contentType?: 'movie' | 'tv' | 'show' | 'anime-tv' | 'anime-movie';
}

const MultiLevelSelector: React.FC<MultiLevelSelectorProps> = ({
  onChange,
  contentType = 'movie',
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    x: number;
    y: number;
    width: number;
  }>({ x: 0, y: 0, width: 0 });
  const [values, setValues] = useState<Record<string, string>>({});
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getTypeOptions = (
    contentType: 'movie' | 'tv' | 'show' | 'anime-tv' | 'anime-movie'
  ) => {
    const baseOptions = [{ label: '全部', value: 'all' }];

    switch (contentType) {
      case 'movie':
        return [
          ...baseOptions,
          { label: '喜剧', value: 'comedy' },
          { label: '爱情', value: 'romance' },
          { label: '动作', value: 'action' },
          { label: '科幻', value: 'sci-fi' },
          { label: '悬疑', value: 'suspense' },
          { label: '犯罪', value: 'crime' },
          { label: '惊悚', value: 'thriller' },
          { label: '冒险', value: 'adventure' },
          { label: '音乐', value: 'music' },
          { label: '历史', value: 'history' },
          { label: '奇幻', value: 'fantasy' },
          { label: '恐怖', value: 'horror' },
          { label: '战争', value: 'war' },
          { label: '传记', value: 'biography' },
          { label: '歌舞', value: 'musical' },
          { label: '武侠', value: 'wuxia' },
          { label: '情色', value: 'erotic' },
          { label: '灾难', value: 'disaster' },
          { label: '西部', value: 'western' },
          { label: '纪录片', value: 'documentary' },
          { label: '短片', value: 'short' },
        ];
      case 'tv':
        return [
          ...baseOptions,
          { label: '喜剧', value: 'comedy' },
          { label: '爱情', value: 'romance' },
          { label: '悬疑', value: 'suspense' },
          { label: '武侠', value: 'wuxia' },
          { label: '古装', value: 'costume' },
          { label: '家庭', value: 'family' },
          { label: '犯罪', value: 'crime' },
          { label: '科幻', value: 'sci-fi' },
          { label: '恐怖', value: 'horror' },
          { label: '历史', value: 'history' },
          { label: '战争', value: 'war' },
          { label: '动作', value: 'action' },
          { label: '冒险', value: 'adventure' },
          { label: '传记', value: 'biography' },
          { label: '剧情', value: 'drama' },
          { label: '奇幻', value: 'fantasy' },
          { label: '惊悚', value: 'thriller' },
          { label: '灾难', value: 'disaster' },
          { label: '歌舞', value: 'musical' },
          { label: '音乐', value: 'music' },
        ];
      case 'show':
        return [
          ...baseOptions,
          { label: '真人秀', value: 'reality' },
          { label: '脱口秀', value: 'talkshow' },
          { label: '音乐', value: 'music' },
          { label: '歌舞', value: 'musical' },
        ];
      case 'anime-tv':
      case 'anime-movie':
      default:
        return baseOptions;
    }
  };

  const getRegionOptions = (
    contentType: 'movie' | 'tv' | 'show' | 'anime-tv' | 'anime-movie'
  ) => {
    const baseOptions = [{ label: '全部', value: 'all' }];

    switch (contentType) {
      case 'movie':
      case 'anime-movie':
        return [
          ...baseOptions,
          { label: '华语', value: 'chinese' },
          { label: '欧美', value: 'western' },
          { label: '韩国', value: 'korean' },
          { label: '日本', value: 'japanese' },
          { label: '中国大陆', value: 'mainland_china' },
          { label: '美国', value: 'usa' },
          { label: '中国香港', value: 'hong_kong' },
          { label: '中国台湾', value: 'taiwan' },
          { label: '英国', value: 'uk' },
          { label: '法国', value: 'france' },
          { label: '德国', value: 'germany' },
          { label: '意大利', value: 'italy' },
          { label: '西班牙', value: 'spain' },
          { label: '印度', value: 'india' },
          { label: '泰国', value: 'thailand' },
          { label: '俄罗斯', value: 'russia' },
          { label: '加拿大', value: 'canada' },
          { label: '澳大利亚', value: 'australia' },
          { label: '爱尔兰', value: 'ireland' },
          { label: '瑞典', value: 'sweden' },
          { label: '巴西', value: 'brazil' },
          { label: '丹麦', value: 'denmark' },
        ];
      case 'tv':
      case 'anime-tv':
      case 'show':
        return [
          ...baseOptions,
          { label: '华语', value: 'chinese' },
          { label: '欧美', value: 'western' },
          { label: '国外', value: 'foreign' },
          { label: '韩国', value: 'korean' },
          { label: '日本', value: 'japanese' },
          { label: '中国大陆', value: 'mainland_china' },
          { label: '中国香港', value: 'hong_kong' },
          { label: '美国', value: 'usa' },
          { label: '英国', value: 'uk' },
          { label: '泰国', value: 'thailand' },
          { label: '中国台湾', value: 'taiwan' },
          { label: '意大利', value: 'italy' },
          { label: '法国', value: 'france' },
          { label: '德国', value: 'germany' },
          { label: '西班牙', value: 'spain' },
          { label: '俄罗斯', value: 'russia' },
          { label: '瑞典', value: 'sweden' },
          { label: '巴西', value: 'brazil' },
          { label: '丹麦', value: 'denmark' },
          { label: '印度', value: 'india' },
          { label: '加拿大', value: 'canada' },
          { label: '爱尔兰', value: 'ireland' },
          { label: '澳大利亚', value: 'australia' },
        ];
      default:
        return baseOptions;
    }
  };

  const getLabelOptions = (
    contentType: 'movie' | 'tv' | 'show' | 'anime-tv' | 'anime-movie'
  ) => {
    const baseOptions = [{ label: '全部', value: 'all' }];
    switch (contentType) {
      case 'anime-movie':
        return [
          ...baseOptions,
          { label: '定格动画', value: 'stop_motion' },
          { label: '传记', value: 'biography' },
          { label: '美国动画', value: 'us_animation' },
          { label: '爱情', value: 'romance' },
          { label: '黑色幽默', value: 'dark_humor' },
          { label: '歌舞', value: 'musical' },
          { label: '儿童', value: 'children' },
          { label: '二次元', value: 'anime' },
          { label: '动物', value: 'animal' },
          { label: '青春', value: 'youth' },
          { label: '历史', value: 'history' },
          { label: '励志', value: 'inspirational' },
          { label: '恶搞', value: 'parody' },
          { label: '治愈', value: 'healing' },
          { label: '运动', value: 'sports' },
          { label: '后宫', value: 'harem' },
          { label: '情色', value: 'erotic' },
          { label: '人性', value: 'human_nature' },
          { label: '悬疑', value: 'suspense' },
          { label: '恋爱', value: 'love' },
          { label: '魔幻', value: 'fantasy' },
          { label: '科幻', value: 'sci_fi' },
        ];
      case 'anime-tv':
        return [
          ...baseOptions,
          { label: '黑色幽默', value: 'dark_humor' },
          { label: '历史', value: 'history' },
          { label: '歌舞', value: 'musical' },
          { label: '励志', value: 'inspirational' },
          { label: '恶搞', value: 'parody' },
          { label: '治愈', value: 'healing' },
          { label: '运动', value: 'sports' },
          { label: '后宫', value: 'harem' },
          { label: '情色', value: 'erotic' },
          { label: '国漫', value: 'chinese_anime' },
          { label: '人性', value: 'human_nature' },
          { label: '悬疑', value: 'suspense' },
          { label: '恋爱', value: 'love' },
          { label: '魔幻', value: 'fantasy' },
          { label: '科幻', value: 'sci_fi' },
        ];
      default:
        return baseOptions;
    }
  };

  const getPlatformOptions = (
    contentType: 'movie' | 'tv' | 'show' | 'anime-tv' | 'anime-movie'
  ) => {
    const baseOptions = [{ label: '全部', value: 'all' }];

    switch (contentType) {
      case 'movie':
        return baseOptions;
      case 'tv':
      case 'anime-tv':
      case 'show':
        return [
          ...baseOptions,
          { label: '腾讯视频', value: 'tencent' },
          { label: '爱奇艺', value: 'iqiyi' },
          { label: '优酷', value: 'youku' },
          { label: '湖南卫视', value: 'hunan_tv' },
          { label: 'Netflix', value: 'netflix' },
          { label: 'HBO', value: 'hbo' },
          { label: 'BBC', value: 'bbc' },
          { label: 'NHK', value: 'nhk' },
          { label: 'CBS', value: 'cbs' },
          { label: 'NBC', value: 'nbc' },
          { label: 'tvN', value: 'tvn' },
        ];
      default:
        return baseOptions;
    }
  };

  const categories: MultiLevelCategory[] = [
    ...(contentType !== 'anime-tv' && contentType !== 'anime-movie'
      ? [
        {
          key: 'type',
          label: '类型',
          options: getTypeOptions(contentType),
        },
      ]
      : [
        {
          key: 'label',
          label: '类型',
          options: getLabelOptions(contentType),
        },
      ]),
    {
      key: 'region',
      label: '地区',
      options: getRegionOptions(contentType),
    },
    {
      key: 'year',
      label: '年代',
      options: [
        { label: '全部', value: 'all' },
        { label: '2020年代', value: '2020s' },
        { label: '2026', value: '2026' },
        { label: '2025', value: '2025' },
        { label: '2024', value: '2024' },
        { label: '2023', value: '2023' },
        { label: '2022', value: '2022' },
        { label: '2021', value: '2021' },
        { label: '2020', value: '2020' },
        { label: '2019', value: '2019' },
        { label: '2010年代', value: '2010s' },
        { label: '2000年代', value: '2000s' },
        { label: '90年代', value: '1990s' },
        { label: '80年代', value: '1980s' },
        { label: '70年代', value: '1970s' },
        { label: '60年代', value: '1960s' },
        { label: '更早', value: 'earlier' },
      ],
    },
    ...(contentType === 'tv' ||
      contentType === 'show' ||
      contentType === 'anime-tv'
      ? [
        {
          key: 'platform',
          label: '平台',
          options: getPlatformOptions(contentType),
        },
      ]
      : []),
    {
      key: 'sort',
      label: '排序',
      options: [
        { label: '综合排序', value: 'T' },
        { label: '近期热度', value: 'U' },
        {
          label:
            contentType === 'tv' || contentType === 'show'
              ? '首播时间'
              : '首映时间',
          value: 'R',
        },
        { label: '高分优先', value: 'S' },
      ],
    },
  ];

  const calculateDropdownPosition = (categoryKey: string) => {
    const element = categoryRefs.current[categoryKey];
    if (element) {
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth < 768;

      let x = rect.left;
      let dropdownWidth = Math.max(rect.width, 300);
      let useFixedWidth = false;

      if (isMobile) {
        const padding = 16;
        const maxWidth = viewportWidth - padding * 2;
        dropdownWidth = Math.min(dropdownWidth, maxWidth);
        useFixedWidth = true;

        if (x + dropdownWidth > viewportWidth - padding) {
          x = viewportWidth - dropdownWidth - padding;
        }

        if (x < padding) {
          x = padding;
        }
      }

      setDropdownPosition({
        x,
        y: rect.bottom,
        width: useFixedWidth ? dropdownWidth : rect.width,
      });
    }
  };

  const handleCategoryClick = (categoryKey: string) => {
    if (activeCategory === categoryKey) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryKey);
      calculateDropdownPosition(categoryKey);
    }
  };

  const handleOptionSelect = (categoryKey: string, optionValue: string) => {
    const newValues = {
      ...values,
      [categoryKey]: optionValue,
    };

    setValues(newValues);

    const defaultSort = (contentType === 'anime-tv' || contentType === 'anime-movie') ? 'U' : 'T';
    const selectionsForParent: Record<string, string> = {
      type: 'all',
      region: 'all',
      year: 'all',
      platform: 'all',
      label: 'all',
      sort: defaultSort,
    };

    Object.entries(newValues).forEach(([key, value]) => {
      if (value && value !== 'all' && (key !== 'sort' || value !== defaultSort)) {
        const category = categories.find((cat) => cat.key === key);
        if (category) {
          const option = category.options.find((opt) => opt.value === value);
          if (option) {
            selectionsForParent[key] =
              key === 'sort' ? option.value : option.label;
          }
        }
      }
    });

    onChange(selectionsForParent);

    setActiveCategory(null);
  };

  const getDisplayText = (categoryKey: string) => {
    const category = categories.find((cat) => cat.key === categoryKey);
    if (!category) return '';

    const value = values[categoryKey];

    if (categoryKey === 'sort') {
      const option = category.options.find((opt) => opt.value === value);
      return option?.label || category.label;
    }

    if (!value || value === 'all') {
      return category.label;
    }
    const option = category.options.find((opt) => opt.value === value);
    return option?.label || category.label;
  };

  const isDefaultValue = (categoryKey: string) => {
    const value = values[categoryKey];
    if (categoryKey === 'sort') {
      return false;
    }
    return !value || value === 'all';
  };

  const isOptionSelected = (categoryKey: string, optionValue: string) => {
    let value = values[categoryKey];
    if (value === undefined) {
      value = 'all';
      if (categoryKey === 'sort') {
        value = (contentType === 'anime-tv' || contentType === 'anime-movie') ? 'U' : 'T';
      }
    }
    return value === optionValue;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (activeCategory) {
        setActiveCategory(null);
      }
    };

    const handleResize = () => {
      if (activeCategory) {
        calculateDropdownPosition(activeCategory);
      }
    };

    document.body.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      document.body.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeCategory]);

  useEffect(() => {
    const defaultSort = (contentType === 'anime-tv' || contentType === 'anime-movie') ? 'U' : 'T';
    onChange({
      type: 'all',
      region: 'all',
      year: 'all',
      platform: 'all',
      label: 'all',
      sort: defaultSort,
    });
  }, [contentType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !Object.values(categoryRefs.current).some(
          (ref) => ref && ref.contains(event.target as Node)
        )
      ) {
        setActiveCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  const updateIndicatorPosition = (categoryKey: string) => {
    const element = categoryRefs.current[categoryKey];
    if (element) {
      const timeoutId = setTimeout(() => {
        const rect = element.getBoundingClientRect();
        const container = element.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          setIndicatorStyle({
            left: rect.left - containerRect.left,
            width: rect.width,
          });
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  };

  useEffect(() => {
    if (activeCategory) {
      const cleanup = updateIndicatorPosition(activeCategory);
      return cleanup;
    }
  }, [activeCategory]);

  return (
    <>
      <div className='relative inline-flex bg-gray-200/60 rounded-full p-0.5 sm:p-1 dark:bg-gray-700/60 backdrop-blur-sm'>
        {indicatorStyle.width > 0 && (
          <div
            className='absolute top-0.5 bottom-0.5 sm:top-1 sm:bottom-1 bg-white dark:bg-gray-500 rounded-full shadow-sm transition-all duration-300 ease-out'
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        )}

        {categories.map((category) => (
          <div
            key={category.key}
            ref={(el) => {
              categoryRefs.current[category.key] = el;
            }}
            className='relative'
          >
            <button
              onClick={() => handleCategoryClick(category.key)}
              className={`relative z-10 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                activeCategory === category.key
                  ? isDefaultValue(category.key)
                    ? 'text-gray-900 dark:text-gray-100 cursor-default'
                    : 'text-gray-900 dark:text-gray-100 cursor-default'
                  : isDefaultValue(category.key)
                    ? 'text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer'
                    : 'text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer'
              }`}
            >
              {getDisplayText(category.key)}
            </button>
          </div>
        ))}
      </div>

      {activeCategory && (
        <div
          ref={dropdownRef}
          className='fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto'
          style={{
            left: `${dropdownPosition.x}px`,
            top: `${dropdownPosition.y + 8}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          <div className='p-2'>
            {categories
              .find((cat) => cat.key === activeCategory)
              ?.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(activeCategory, option.value)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    isOptionSelected(activeCategory, option.value)
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default MultiLevelSelector;
