import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
// --------------------------------------------------------------------------
const Pagination = ({ items, itemsPerPage, sendDataToParent }) => {
  console.log("rerender", items, itemsPerPage)
  // console.log("items:: ", items);
  // console.log("itemsPerPage:: ", itemsPerPage);
  // console.log("sendDataToParent:: ", sendDataToParent);

  // We start with an empty list of items.
  const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  // Here we use item offsets; we could also use page offsets
  // following the API or data you're working with.
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    // console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    setCurrentItems(items.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(items.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, items]);

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    // console.log(
    //   `User requested page number ${event.selected}, which is offset ${newOffset}`
    // );
    setItemOffset(newOffset);
  };

  useEffect(() => {
    if (currentItems) {
      sendDataToParent(currentItems);
    }
  }, [currentItems]);
  return (
    <div >
      <ReactPaginate
        nextLabel="Next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        marginPagesDisplayed={2}
        pageCount={pageCount}
        previousLabel="< Previous"
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="page-item"
        previousLinkClassName="page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link"
        breakLabel="..."
        breakClassName="page-item"
        breakLinkClassName="page-link"
        containerClassName="pagination"
        activeClassName="active-page-item"
        renderOnZeroPageCount={null}
      />
    </div>
  );
};

export default Pagination;
