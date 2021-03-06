import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Divider, Input, InputRef, message, Popconfirm, Row, Space, Table, TablePaginationConfig } from 'antd';
import Highlighter from 'react-highlight-words';
import { EllipsisOutlined, SearchOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { DataIndex } from 'rc-table/lib/interface';
import { FilterConfirmProps, FilterDropdownProps, FilterValue, SorterResult } from 'antd/es/table/interface';

import AuthorityTag from '../../component/AuthorityTag';
import { deleteUser, fetchUsers } from '../../utils/api/api';
import { authorityEnum, defaultPagination } from './constant';
import { joinFilterValue, joinOrderValue } from '../../utils/utils';
import UserCreate from './UserCreate';
import UserEdit from './UserEdit';
import UserDetail from './UserDetail';

export default function UserManage() {
  const [userList, setUserList] = useState<Entity.User[]>([]);
  const [nowPagnination, setNowPagnination] = useState<TablePaginationConfig>({
    ...defaultPagination
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInputRef = useRef<InputRef>(null);

  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [chosenUid, setChosenUid] = useState<number>(0);

  const handleSearch = (selectedKeys: React.Key[], confirm: (param?: FilterConfirmProps) => void, dataIndex: DataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]?.toString() ?? '');
    setSearchedColumn(dataIndex.toString());
  };

  const handleReset = (clearFilters: (() => void) | undefined) => {
    if (clearFilters) clearFilters();
    setSearchText('');
  };

  const ColumnSearchPlugin = (dataIndex: keyof Entity.User) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInputRef}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0] ?? ''}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]?.toString() ?? '');
              setSearchedColumn(dataIndex.toString());
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: () => true,
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInputRef?.current?.select(), 100);
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: (text: any) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      )
  });

  const userColumn: ColumnsType<Entity.User> = [
    {
      title: 'uid',
      dataIndex: 'uid',
      key: 'uid'
    },
    {
      title: '?????????',
      dataIndex: 'userName',
      key: 'userName',
      ...ColumnSearchPlugin('userName')
    },
    {
      title: '????????????',
      dataIndex: 'userProjectNum',
      key: 'userProjectNum'
    },
    {
      title: '????????????',
      dataIndex: 'userDes',
      key: 'userDes'
    },
    {
      title: '????????????',
      dataIndex: 'createDate',
      key: 'createDate'
    },
    {
      title: '????????????',
      dataIndex: 'authority',
      key: 'authority',
      render: authority => <AuthorityTag authority={authority} />,
      filters: authorityEnum,
      filterMultiple: false
    },
    {
      title: '??????',
      key: 'action',
      fixed: 'right',
      render: (value: Entity.User) => (
        <Space>
          <Button
            size="middle"
            shape="circle"
            icon={<EllipsisOutlined />}
            onClick={() => {
              setChosenUid(value.uid);
              setDetailVisible(true);
            }}
          />
          <UserEdit onCreateFinish={refreshTable} initRecord={value} />
          <Popconfirm
            placement="topLeft"
            title={`???????????????????????????`}
            onConfirm={async () => {
              setDeleteLoading(true);
              try {
                const userDeleteRes = await deleteUser({ uid: value.uid });
                console.log('userDeleteRes', userDeleteRes);
                if (userDeleteRes.status === 204) {
                  message.success(`???????????? ${value.userName} ?????????`);
                }
              } catch (error) {
                message.error(`???????????? ${value.userName} ??????, ?????????console`);
              }
              refreshTable();
              setDeleteLoading(false);
            }}
            okText="???"
            cancelText="???"
          >
            <Button size="middle" danger shape="circle" icon={<UserDeleteOutlined />} loading={deleteLoading} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Entity.User> | SorterResult<Entity.User>[]
  ) => {
    setLoading(true);
    // console.log('filters', filters);
    fetchUsers({
      current: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? 5,
      authority: joinFilterValue(filters['authority']),
      ordering: joinOrderValue(sorter),
      search: joinFilterValue(filters['userName'])
    })
      .then(({ data: newUserList }) => {
        console.log('fetchUsers result', newUserList);
        setUserList(newUserList.data);
        setNowPagnination({
          ...defaultPagination,
          pageSize: newUserList.pageSize,
          total: newUserList.total,
          current: newUserList.current
        });
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.error('error:', err);
        message.error(`????????????, ?????????console!`);
      });
  };

  const refreshTable = () => handleTableChange({}, {}, {});

  useEffect(() => refreshTable(), []);

  return (
    <Row>
      <Col span={24}>
        <Card>
          <Space direction="horizontal" align="baseline" size="middle" wrap>
            <UserCreate onCreateFinish={refreshTable} />
          </Space>
          <Divider />
          <Table<Entity.User>
            loading={loading}
            dataSource={userList}
            columns={userColumn}
            rowKey={record => record.uid}
            pagination={nowPagnination}
            onChange={handleTableChange}
          />
        </Card>
        <UserDetail onClose={() => setDetailVisible(false)} visible={detailVisible} uid={chosenUid}></UserDetail>
      </Col>
    </Row>
  );
}
