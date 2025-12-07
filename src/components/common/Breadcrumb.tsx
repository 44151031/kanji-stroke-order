/**
 * パンくずリスト（Breadcrumb）コンポーネント
 * 
 * 各ページで使用されているパンくずリストの構造をそのまま再現し、
 * 見た目・スタイル・アクセシビリティ属性を完全に維持します。
 */

import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  className?: string; // 個別のアイテムにスタイルを適用する場合
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /**
   * nav要素のクラス名
   * デフォルト: "w-full text-sm text-muted-foreground"
   */
  navClassName?: string;
  /**
   * ol要素のクラス名
   * デフォルト: "flex items-center gap-2"
   */
  olClassName?: string;
  /**
   * リンクのクラス名
   * デフォルト: "hover:text-foreground"
   */
  linkClassName?: string;
  /**
   * 現在のページ（最後のアイテム）のクラス名
   * デフォルト: "text-foreground"
   */
  currentClassName?: string;
  /**
   * aria-label属性
   */
  ariaLabel?: string;
  /**
   * flex-wrapを使用するか
   */
  flexWrap?: boolean;
  /**
   * セパレータ（"/"）にaria-hiddenを付与するか
   */
  separatorAriaHidden?: boolean;
  /**
   * 最後のアイテムにaria-current="page"を付与するか
   */
  currentAriaCurrent?: boolean;
  /**
   * 最後のアイテムにfont-mediumを付与するか
   */
  currentFontMedium?: boolean;
}

export default function Breadcrumb({
  items,
  navClassName = "w-full text-sm text-muted-foreground",
  olClassName = "flex items-center gap-2",
  linkClassName = "hover:text-foreground",
  currentClassName = "text-foreground",
  ariaLabel,
  flexWrap = false,
  separatorAriaHidden = false,
  currentAriaCurrent = false,
  currentFontMedium = false,
}: BreadcrumbProps) {
  if (items.length === 0) return null;

  const olClasses = flexWrap 
    ? `${olClassName} flex-wrap` 
    : olClassName;

  const lastIndex = items.length - 1;

  return (
    <nav 
      className={navClassName}
      {...(ariaLabel && { "aria-label": ariaLabel })}
    >
      <ol className={olClasses}>
        {items.map((item, index) => {
          const isLast = index === lastIndex;
          const isLink = item.href !== undefined;

          return (
            <React.Fragment key={index}>
              <li
                className={
                  !isLink && isLast
                    ? item.className ||
                      `${currentClassName}${currentFontMedium ? " font-medium" : ""}`
                    : undefined
                }
                {...(isLast && !isLink && currentAriaCurrent && { "aria-current": "page" })}
              >
                {isLink ? (
                  <Link 
                    href={item.href!} 
                    className={item.className || linkClassName}
                  >
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </li>
              {!isLast && (
                <li {...(separatorAriaHidden && { "aria-hidden": "true" })}>
                  /
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

