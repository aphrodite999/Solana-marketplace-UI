import React, { useEffect, useState } from 'react';
import 'font-awesome/css/font-awesome.min.css';

import NFTimg from '../../assets/logo/bofida.png';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'Date', headerName: 'DATE', width: 130 },
  { field: 'NFT', headerName: '', type: 'picture', width: 70 },
  { field: 'Name', headerName: 'NAME', width: 150 },
  { field: 'Floor', headerName: 'FLOOR', width: 100 },
  { field: 'Highest', headerName: 'HIGHEST', width: 100 },
  { field: 'Offer', headerName: 'YOUR OFFER', width: 100 },
  { field: 'Status', headerName: 'STATUS', width: 150 },
  { field: 'Actions', headerName: '', width: 400 },

];

const rows = [
  { id: 1, Date: 'Snow', NFT: '../../assets/logo/bofida.png', Name: 'Jon', Floor: 35, Highest: '4 SOL', Offer: '3 SOL', Status: 'Active', Actions: 0 },
  { id: 2, Date: 'Lannister', NFT: '../../assets/logo/bofida.png', Name: 'Cersei', Floor: 42, Highest: '4 SOL', Offer: '3 SOL', Status: 'Invalid', Actions: 0 },
  { id: 3, Date: 'Lannister', NFT: '../../assets/logo/bofida.png', Name: 'Jaime', Floor: 45, Highest: '4 SOL', Offer: '3 SOL', Status: 'Rejected', Actions: 0 },
  { id: 4, Date: 'Stark', NFT: '../../assets/logo/bofida.png', Name: 'Arya', Floor: 16, Highest: '4 SOL', Offer: '3 SOL', Status: 'Canceled', Actions: 1 },
  { id: 5, Date: 'Targaryen', NFT: '../../assets/logo/bofida.png', Name: 'Daenerys', Floor: null, Highest: '4 SOL', Offer: '3 SOL', Status: 'Active', Actions: 0 },
  { id: 6, Date: 'Melisandre', NFT: '../../assets/logo/bofida.png', Name: null, Floor: 150, Highest: '4 SOL', Offer: '3 SOL', Status: 'Rejected', Actions: 0 },
  { id: 7, Date: 'Clifford', NFT: '../../assets/logo/bofida.png', Name: 'Ferrara', Floor: 44, Highest: '4 SOL', Offer: '3 SOL', Status: 'Invalid', Actions: 1 },
  { id: 8, Date: 'Frances', NFT: '../../assets/logo/bofida.png', Name: 'Rossini', Floor: 36, Highest: '4 SOL', Offer: '3 SOL', Status: 'Canceled', Actions: 1 },
  { id: 9, Date: 'Roxie', NFT: '../../assets/logo/bofida.png', Name: 'Harvey', Floor: 65, Highest: '4 SOL', Offer: '3 SOL', Status: 'Active', Actions: 0 },
];

export const PageHeader = ({ OfferState }: any) => {

  const [collectionList, setCollectionList] = useState<any>([]);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPageNumber, setLastPageNumber] = useState(Math.ceil(rows.length / perPage + 1));

  useEffect(() => {
    getCollectionList();
  }, [perPage, collectionList.length])

  const getCollectionList = () => {
    const startNumber = (currentPage - 1) * perPage;
    const lastNumber = startNumber + perPage;
    const draftList = rows.slice(startNumber, lastNumber);
    console.log('getCollectionList', draftList)
    setCollectionList(draftList);
  }

  const changeBidStatus = (index: number) => {
    rows[index].Actions = 1 - rows[index].Actions;
    getCollectionList();
  }

  const returnState = (state: any) => {
    let returnValue;
    switch (state) {
      case 'Active':
        returnValue = 'active';
        break;
      case 'Rejected':
        returnValue = 'rejected';
        break;
      case 'Invalid':
        returnValue = 'invalid';
        break;
      case 'Canceled':
        returnValue = 'canceled';
        break;

      default:
        break;
    }

    return returnValue;
  }

  return (
    <div >
      <table className='table table-borderless text-primary'>
        <thead>
          <tr className='justify-content-center'>
            <th style={{ width: '5%' }}><input type="checkbox" style={{ height: 20, width: 20, backgroundColor: 'transparent', borderWidth: 1 }} /></th>
            <th>Date</th>
            <th>img</th>
            <th>Name</th>
            <th>Floor</th>
            <th>Highest</th>
            <th>Offer</th>
            <th>Status</th>
            <th className="flex justify-content-center">Actions</th>
          </tr>
        </thead>
        <tbody className='text-secondary'>
          {collectionList.map((data: any, index: any) => {
            return (
              <tr key={data.id} className='justify-content-start'>
                <td>
                  <input type="checkbox" style={{ height: 20, width: 20 }} />
                </td>
                <td>{data.Date}</td>
                <td>
                  <img src={data.NFT} alt='img' />
                </td>
                <td>{data.Name}</td>
                <td>{data.Floor}</td>
                <td>{data.Highest}</td>
                <td>{data.Offer}</td>
                <td className={returnState(data.Status)}>{data.Status}</td>
                <td className="flex">
                  {OfferState == 'Offer Made' ?
                    <>
                      <button className="page-link col-sm-4" >{data.Actions === 0 ? 'Amend' : 'Re-initate'}</button>
                      <button className="page-link col-sm-4" style={{ opacity: data.Actions == 0 ? 1 : 0 }}>{data.Actions === 0 ? 'Cancel' : ''}</button>
                      <button className="page-link col-sm-4">Message Seller</button>
                    </>
                    :
                    <>
                      <button className="page-link col-sm-4" style={{ opacity: data.Actions == 0 ? 1 : 0 }}> Accept</button>
                      <button className="page-link col-sm-4"  style={{ opacity: data.Actions == 0 ? 1 : 0 }}>Canceled</button>
                      <button className="page-link col-sm-4">Message Seller</button>
                    </>
                  }
                </td>
              </tr>
            )
          })
          }
        </tbody>
      </table>
      <div>
        <li className="flex align-items-center pagination pagination-sm justify-content-between">
          <ul className="pagination pagination-sm">
            <li className="page-item">
              <a className="page-link" onClick={() => setCurrentPage(1)}><i className='fa fa-fast-backward'></i></a>
            </li>
            <li className="page-item">
              <a className={`${currentPage === 1 ? 'disabled page-link' : 'page-link'}`} onClick={() => setCurrentPage(currentPage - 1)}><i className='fa fa-backward'></i></a>
            </li>
            <li className="page-item">
              <a className={`${currentPage === lastPageNumber ? 'disabled page-link' : 'page-link'}`} onClick={() => setCurrentPage(currentPage + 1)}><i className='fa fa-forward'></i></a>
            </li>
            <li className="page-item">
              <a className="page-link" onClick={() => setCurrentPage(lastPageNumber)}><i className='fa fa-fast-forward'></i></a>
            </li>
            <li className='flex align-item-center'>
              <label>page {currentPage} of {lastPageNumber} | Go to page: </label>
            </li>
          </ul>
          <ul className='float-end'>
            <li className='page-item'>
              <select value={perPage} className="page-link" onChange={(e) => setPerPage(Number(e.target.value))}>
                <option value='5'>5</option>
                <option value='10'>10</option>
                <option value='15'>15</option>
                <option value='20'>20</option>
              </select>
            </li>
          </ul>
        </li>
      </div>
    </div>
  );
};