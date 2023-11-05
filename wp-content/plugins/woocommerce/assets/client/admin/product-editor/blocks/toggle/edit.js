"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Edit=void 0;const element_1=require("@wordpress/element"),block_editor_1=require("@wordpress/block-editor"),core_data_1=require("@wordpress/core-data"),components_1=require("@wordpress/components"),sanitize_html_1=require("../../utils/sanitize-html");function Edit({attributes:e}){const t=(0,block_editor_1.useBlockProps)(),{label:o,property:r,disabled:s,disabledCopy:i}=e,[l,n]=(0,core_data_1.useEntityProp)("postType","product",r);return(0,element_1.createElement)("div",{...t},(0,element_1.createElement)(components_1.ToggleControl,{label:o,checked:l,disabled:s,onChange:n}),s&&(0,element_1.createElement)("p",{className:"wp-block-woocommerce-product-toggle__disable-copy",dangerouslySetInnerHTML:(0,sanitize_html_1.sanitizeHTML)(i)}))}exports.Edit=Edit;