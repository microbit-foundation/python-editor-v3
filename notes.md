# Notes

## UX issues

### Gutter

Is it weird that the gutter changes width? I think it's fair enough when adding room for another digit, but I think when folding is enabled it should reserve space for itself.

### Last line

Last line behaves weirdly - perhaps because of missing newline or lack of special casing? 
1. Auto-indent doesn't work for last line of the document.
2. Copying that line to insert earlier in the document also doesn't have newline.