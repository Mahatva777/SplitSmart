import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Numeric, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def new_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Group(Base):
    __tablename__ = "groups"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    members: Mapped[list["GroupMember"]] = relationship(
        "GroupMember", back_populates="group", cascade="all, delete-orphan"
    )
    expenses: Mapped[list["Expense"]] = relationship(
        "Expense", back_populates="group", cascade="all, delete-orphan"
    )


class GroupMember(Base):
    __tablename__ = "group_members"
    __table_args__ = (UniqueConstraint("group_id", "user_id"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    group_id: Mapped[str] = mapped_column(String, ForeignKey("groups.id", ondelete="CASCADE"))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    group: Mapped["Group"] = relationship("Group", back_populates="members")
    user: Mapped["User"] = relationship("User")


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    group_id: Mapped[str] = mapped_column(String, ForeignKey("groups.id", ondelete="CASCADE"))
    created_by: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    is_shared_asset: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    group: Mapped["Group"] = relationship("Group", back_populates="expenses")
    creator: Mapped["User"] = relationship("User")
    splits: Mapped[list["ExpenseSplit"]] = relationship(
        "ExpenseSplit", back_populates="expense", cascade="all, delete-orphan"
    )
    shared_asset: Mapped["SharedAssetDetail | None"] = relationship(
        "SharedAssetDetail", back_populates="expense", cascade="all, delete-orphan", uselist=False
    )


class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    expense_id: Mapped[str] = mapped_column(String, ForeignKey("expenses.id", ondelete="CASCADE"))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    amount_owed: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    expense: Mapped["Expense"] = relationship("Expense", back_populates="splits")
    user: Mapped["User"] = relationship("User")


class SharedAssetDetail(Base):
    __tablename__ = "shared_asset_details"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    expense_id: Mapped[str] = mapped_column(
        String, ForeignKey("expenses.id", ondelete="CASCADE"), unique=True
    )
    asset_name: Mapped[str] = mapped_column(String(200), nullable=False)
    purchase_cost: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    delivery_fee: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    setup_fee: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    expected_resale_value: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    total_cost: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    net_ownership_cost: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    per_person_estimate: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    expense: Mapped["Expense"] = relationship("Expense", back_populates="shared_asset")


class Settlement(Base):
    __tablename__ = "settlements"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    group_id: Mapped[str] = mapped_column(String, ForeignKey("groups.id", ondelete="CASCADE"))
    payer_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    payee_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    group: Mapped["Group"] = relationship("Group")
    payer: Mapped["User"] = relationship("User", foreign_keys=[payer_id])
    payee: Mapped["User"] = relationship("User", foreign_keys=[payee_id])
